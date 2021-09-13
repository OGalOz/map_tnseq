#!python3
# this file is a translation of DesignRandomPool.pl into python
# Given the output of MapTnSeq.pl, possibly from multiple runs,
# choose the reliable and unambiguous tags
# Makes a tab-delimited table (Mutant Pool)

# Inputs are one or more MapTnSeq output tables that contain rows:
# read,barcode,scaffold,pos,strand,uniq,qBeg,qEnd

import os
import sys
import logging
import json
import copy
import subprocess
import pandas as pd
import math
from full.PoolStats import RunPoolStatsPy



def RunDesignRandomPool(inp_d, DEBUGPRINT):
    """

    ARGS:
        inp_d: (dict) 
            Required inputs listed in function "ParseInputs" below

        DEBUGPRINT: (bool) Normally False if not checking changes in variables.
            (Make 'True' if you want to print out JSON files in between each part 
            of the function for debugging purposes)

    RETURNS:
        report_dict:
          chao2_report_str: (str)
          print_pool_report_str: (str)
          nUsableBarcodes: (int)
          count_bc_report_str: (str)
          input_process_info: (str)
          total_MTS_table_lines: (int)
          nMapped: (int)
          nReadsForUsable: (int)
    """

    parsed_vars = ParseInputs(inp_d)

    new_vars = InitNewVars1()
    # Including newly created vars in parsed_vars- the dict we use throughout
    # the whole program.
    parsed_vars.update(new_vars)

    if DEBUGPRINT:
        with open(os.path.join(parsed_vars['tmp_dir'], "Vars01.json"), "w") as g:
            g.write(json.dumps(parsed_vars, indent=4))


    # The primary variable created here is barPosCount
    ProcessInputMapTnSeqTables(parsed_vars)


    if DEBUGPRINT:
        with open(os.path.join(parsed_vars['tmp_dir'], "Vars02.json"), "w") as g:
            g.write(json.dumps(parsed_vars, indent=4))

    # This function creates the poolfile handle and writes the header line
    POOLFH = InitPoolFileHandle(parsed_vars["output_fp"])
    parsed_vars["POOL_FH"] = POOLFH

    new_vars = CountBarCodesPrintPool(parsed_vars)
    parsed_vars.update(new_vars)


    if DEBUGPRINT:
        with open(os.path.join(parsed_vars['tmp_dir'], "Vars03.json"), "w") as g:
            parsed_vars["POOL_FH"] = "No handle for json dumps"
            g.write(json.dumps(parsed_vars, indent=4))
            parsed_vars["POOL_FH"] = POOLFH

    GetVariantsPrintPool(parsed_vars)


    if DEBUGPRINT:
        with open(os.path.join(parsed_vars['tmp_dir'], "Vars04.json"), "w") as g:
            parsed_vars["POOL_FH"] = "No handle for json dumps"
            g.write(json.dumps(parsed_vars, indent=4))
            parsed_vars["POOL_FH"] = POOLFH


    Chao2_report_str = getChao2Estimates(parsed_vars['totcodes'], 
            parsed_vars['f1'], 
            parsed_vars['f2'])

    parsed_vars["report_dict"]["chao2_report_str"] = Chao2_report_str
  
    logging.info("Starting to Run Pool Stats")
    PoolStats_res_d = CallPoolStatsPy(parsed_vars)

    logging.info("Finished running Pool Stats and Design Random Pool")

    parsed_vars["report_dict"]["PS_res_d"] = PoolStats_res_d

    if not PoolStats_res_d["failed"]:
        parsed_vars["report_dict"]["gene_hit_frac"] = PoolStats_res_d["fNonEssentialGenesHitRatio"]
    else:
        parsed_vars["report_dict"]["gene_hit_frac"] = "NaN"

    return parsed_vars["report_dict"]



def ParseInputs(input_dict):

    """
    Args:
        input_dict: (dict)
            output_fp: (str) Path to pool file
            genes_table_fp: (str) Path to genes_table
            R_fp: (str) Path to PoolStats.R
            R_op_fp: (str) Path to PoolStats.R output log
            tmp_dir: (str) Path to temporary directory
            minN: (int) Threshold (minimum number of good Reads to support a mapping).
            minFrac: (float) Threshold (minimum fraction of reads of most common
                        location to all others)
            minRatio: (float) Threshold (minimum ratio of reads of most common
                            mapping to second most common mapping).
            maxQBeg: (int) Threshold (max query beginning for a read to pass)
            map_tnseq_table_fps: (list of str)
    """
    
    # Check strings:
    for x in ["output_fp", "genes_table_fp", "R_fp", "tmp_dir", "R_op_fp"]:
        if x not in input_dict or not isinstance(input_dict[x],str):
            raise Exception(x + " must be an argument and must be string")

    # Check floats
    for x in ["minFrac", "minRatio"]:
        if x not in input_dict or not isinstance(input_dict[x],float):
            raise Exception(x + " must be an argument and must be float")
    # Check input files
    if "map_tnseq_table_fps" in input_dict:
        for fp in input_dict["map_tnseq_table_fps"]:
            if not os.path.exists(fp):
                raise Exception("Internal MapTnSeq file {} not found".format(
                    fp))
    else:
        raise Exception("map_tnseq_table_fps not found as input to Design Random Pool")

    # ints
    for x in ["minN", "maxQBeg"]:
        if x not in input_dict or not isinstance(input_dict[x],int):
            raise Exception(x + " must be an argument and must be int")


    logging.info("All input parameters to Design Random Pool passed")

    return input_dict



def CallPoolStatsPy(inp_d):
    """
    Args:
        inp_d: (dict) contains
            output_fp (str) (pool_fp) finished pool file
            genes_table_fp (str) genes table file path
            nMapped (int) 
            tmp_dir (str) Path to tmp_dir

    Returns:
        res_d (dict): If succesful, also contains all below keys from stats_d 
            failed (bool): True if failed, False if succesful
            Error_str (str): Why it failed (?)
        stats_d (dict): has the following 21 keys: (all 'n' are int, all 'f' are float, 'prcnt' is float)
            'nNonPastEnd', 'nUnique_Insertions', 'nSeenMoreThanOnce', 
            'nSeenExactlyTwice', 'fMedian_strains_per_gene', 'fMean_strains_per_gene', 
            'fMedian_reads_per_gene', 'fMean_reads_per_gene', 
            'fBias_reads_per_gene', 'prcnt_gene_and_transposon_ratio_same_strand', 
            'nCentralInsertions',  'nUniqueCentralInsertions', 
            'nGenesWithInsertions', 'nGenesWithCentralInsertions', 'nGenes',
            'nEssentialGenes', 'nNotEssentialGenes', 'nEssentialGenesHit', 
            'nNotEssentialGenesHit', 'fEssentialGenesHitRatio', 
            'fNonEssentialGenesHitRatio'

    """


    res_d = {}
    success_bool, stats_d = RunPoolStatsPy(inp_d['output_fp'], 
                                          inp_d['genes_table_fp'], 
                                          inp_d['nMapped'], 
                                          op_dir=inp_d["tmp_dir"])

    if not success_bool:
        # Unsuccesful attempt
        res_d["failed"] = True
        res_d['Error_str'] = 'Computing poolstats failed.'
    else:
        # Succesful attempt
        res_d.update(stats_d)
        res_d["failed"] = False
        res_d['Error_str'] = ''

    return res_d

    



def RunPoolStatsR(inp_d):
    """
    Args:
        inp_d: (dict) contains
            R_fp (str) Path to R script 'PoolStats.R'
            output_fp (str) (pool_fp) finished pool file
            genes_table_fp (str) genes table file path
            nMapped (int) 
            R_op_fp: (str) Path to R log
            tmp_dir: (str) Path to tmp_dir

    Description:
        We run an R script to get statistics regarding pool
        It actually writes the file to inp_d['R_op_fp'],
        which is the standard error output. 
    """

    R_executable = "Rscript"

    RCmds = [R_executable, 
            inp_d["R_fp"], 
            inp_d["output_fp"],
            inp_d["genes_table_fp"],
            str(inp_d["nMapped"])]


    logging.info("Running R PoolStats")

    std_op = os.path.join(inp_d["tmp_dir"], "R_STD_OP.txt")
    with open(inp_d["R_op_fp"], "w") as f:
        with open(std_op, "w") as g:
            subprocess.call(RCmds, stderr=f, stdout=g)

    if os.path.exists(inp_d["R_op_fp"]):
        logging.info("Succesfully ran R, log found at " + inp_d["R_op_fp"])


def getChao2Estimates(totcodes, f1, f2):
    """
    All inputs are int
    """
    chao = float(totcodes + f1**2)/float(2*f2 + 1)
    report_str = "\nChao2 estimate of #barcodes present (may be inflated for " \
            + "sequencing error): " + str(chao)
    logging.info(report_str)

    return report_str
    



def GetVariantsPrintPool(inp_dict):
    """
    Args:
        inp_dict: (dict) Contains
            barcodeAt: (dict)
                barcode (str) -> list<nTot, nMax, maxAt, nNext, nextAt>
                    where maxAt is a string that splits pos;
            POOL_FH: file handle to output pool file
            nReadsForUsable: (int)
            nMapped: (int)
            output_fp (str): Path to pool file?
    """
    
    nOut = 0
    nMasked = 0
    nMaskedReads = 0
    barcodeAt = inp_dict['barcodeAt']

    # Mutant Pool will have 1 per non "Masked" keys in barcodeAt
    for k in barcodeAt.keys():
        barcode, row = k, barcodeAt[k]
        
        nTot, nMax, maxAt, nNext, nextAt = row

        # This returns a list of strings with each nucleotide
        # subbed with the other three nucleotides (e.g. A -> C,G,T)
        # If there are M barcodes, it return 3*M barcodes.
        variants = Variants(barcode)

        mask = 0

        for variant in variants:
            if (variant in barcodeAt \
                    and barcodeAt[variant][0] > nTot \
                    and barcodeAt[variant][2] == maxAt):
                nMasked += 1
                nMaskedReads += nMax
                mask = 1
                continue

        if mask != 0:
            continue
        
        # maxAt is a key "A:B:C" - scaffold:strand:pos
        atSplit = maxAt.split(":")
        #atSplit[-1] = str(int(float(atSplit[-1])))
       
        # nextAt could be "::" or "A:B:C"
        nextAtSplit = nextAt.split(":")

        if barcode in inp_dict['pastEnd_d']:
            nPastEnd = inp_dict['pastEnd_d'][barcode]
        else:
            nPastEnd = 0

        # barcode, rcbarcode, nTot, nMax, scaffold, strand, pos
        # n2, scaffold2, strand2, pos2, nPastEnd
        inp_dict['POOL_FH'].write("\t".join([
                        barcode,
                        ReverseComplement(barcode),
                        str(nTot),
                        str(nMax),
                        "\t".join(atSplit),
                        str(nNext),
                        "\t".join(nextAtSplit),
                        str(nPastEnd) + "\n"
                        ]))
        nOut += 1

    
    inp_dict['POOL_FH'].close()

    # Here we reopen the pool, and sort it by position
    pool_dtypes = {"pos": 'Int64'}
    pool_df = pd.read_table(inp_dict['output_fp'], sep="\t", dtype=pool_dtypes)
    pool_df.sort_values(by=["scaffold","pos"], inplace=True)
    pool_df.to_csv(inp_dict['output_fp'], sep='\t', index=False)


    report_str = "\nMasked {} off-by-1 barcodes ({} reads) leaving {}".format(
                 nMasked, nMaskedReads, nOut) + " barcodes."
    report_str += "\nReads for those barcodes: {} of {} ({}%)".format(
                inp_dict['nReadsForUsable'], 
                inp_dict['nMapped'], 
                100*(inp_dict['nReadsForUsable'])/(inp_dict['nMapped'] + 10**-6))

    logging.info(report_str)
    inp_dict["report_dict"]["print_pool_report_str"] = report_str

        

def RlogToDict(R_log_fp):
    """
    Args:
        R_log_fp: (str)
    Returns:
        res_d: (dict) 'results dict'
            failed: (bool) True if failed.
            [Error_str]: exists if failed=True
            insertions: (int)
            diff_loc: (int)
            nPrtn_cntrl: (int)
            cntrl_ins: (int)
            cntrl_distinct: (int)
            essential_hit_rate: (float) Rate of hits for putatively essential genes
            other_hit_rate: (float) Rate of hits for all genes besides those essential ones.
            num_surp: (int) # number surprising insertions
            stn_per_prtn_median: (int)
            stn_per_prtn_mean: (float)
            gene_trspsn_same_prcnt: (float)
            reads_per_prtn_median: (int)
            reads_per_prtn_mean: (float)
            reads_per_mil_prtn_median: (float)
            reads_per_mil_prtn_mean: (float)
    Description:
        We take the Standard Error output of PoolStats.R and parse it
        in a crude manner. 
    """
    with open(R_log_fp, "r") as f:
        rlog_str = f.read()

    res_d = {"failed": False}

    rlog_l = rlog_str.split("\n")

    if rlog_str == '':
        res_d["failed"] = True
        res_d['Error_str'] = 'PoolStats failed to create any results at ' + R_log_fp

        return res_d
    elif len(rlog_l) < 11:
        res_d["failed"] = True
        res_d["Error_str"] = 'PoolStats output does not have 11 lines as expected:\n"' + rlog_str
        return res_d

    
    logging.debug(rlog_l)


    res_d['insertions'] = catch_NaN(rlog_l[0].split(' ')[0])
    res_d['diff_loc'] = catch_NaN(rlog_l[0].split(' ')[6])
    res_d['cntrl_ins'] = catch_NaN(rlog_l[1].split(' ')[1])
    res_d['cntrl_distinct'] = catch_NaN(rlog_l[1].split(' ')[3][1:])
    res_d['nPrtn_cntrl'] = catch_NaN(rlog_l[2].split(' ')[4])
    res_d["essential_hit_rate"] = catch_NaN(rlog_l[3].split(' ')[6])
    res_d["other_hit_rate"] = catch_NaN(rlog_l[3].split(' ')[8])
    res_d["num_surp"] = catch_NaN(rlog_l[5].split(' ')[1])
    res_d['stn_per_prtn_median'] = catch_NaN(rlog_l[7].split(' ')[5])
    res_d['stn_per_prtn_mean'] = catch_NaN(rlog_l[7].split(' ')[-1])
    res_d['gene_trspsn_same_prcnt'] = catch_NaN(rlog_l[8].split(' ')[-1][:-1])
    res_d['reads_per_prtn_median'] = catch_NaN(rlog_l[9].split(' ')[5])
    res_d['reads_per_prtn_mean'] = catch_NaN(rlog_l[9].split(' ')[7])
    res_d['reads_per_mil_prtn_median'] = catch_NaN(rlog_l[10].split(' ')[-3])
    res_d['reads_per_mil_prtn_mean'] = catch_NaN(rlog_l[10].split(' ')[-1])

    logging.info("Results from parsing PoolStats.R output:")
    logging.info(res_d)

    return res_d


def catch_NaN(val):
    # val is a string. If not a number returns NaN
    if val in ["NaN", "NA"]:
        val = "NaN"
    else:
        try:
            val = float(val)
        except ValueError:
            val = "NaN"
        if val - math.floor(val) == 0:
            val = int(val)
    return val


def CountBarCodesPrintPool(inp_dict):
    """
    Description:
        We go through the dict barPosCount's keys, 
        We track Categories of barcodes through "nInCategory".
        Usable are the barcodes that passed all tests and go to the pool file

    Args:
        inp_dict contains:
            barPosCount: (dict) A dict which maps to dicts with each subdict 
                being a key (scf:strand:pos) which maps to a list with 
                [nReads, nGoodReads]
            pastEnd_d: (dict) A dictionary mapping barcode of pastEnds to num times seen 
                            If scaffold is "pastEnd" we add it to the pastEnd dict
            minN: (int)
            POOL_FH: File Handle for pool file
            minFrac: (float)
            minRatio: (float) 
    """
    
    # For barcodes, f1 is number seen once, f2 is number seen twice,
    # totcodes is number of barcodes seen.
    f1 = 0
    f2 = 0
    totcodes = 0


    # Classification of bcs
    nInCategory = {
                   "Usable": 0, 
                   "PastEnd": 0, 
                   "NoCons":0, 
                   "FewGood": 0, 
                   "LoRatio": 0
                   }
    SCAFFOLD, POS, STRAND, UNIQ, QBEG, QEND, SCORE, IDENTITY = range(8)

    # Barcodes seen more than once
    nMulti = 0
    
    # barcode to list of nTot, nMax, at, nNext, nextAt
    barcodeAt= {}

    # counts the sum of the total number of reads for the usable barcodes
    # -- Used for report
    nReadsForUsable = 0 

    """
    Note: key_d is a dict with a specific format:
    {key1: [nReads, nGoodReads], key2: [nReads, nGoodReads, ...}
    where key1, key2, are in format scaffold:strand:position 
        where scaffold is name of scaffold (str), strand is +/-, position is int
    """
    for k in inp_dict['barPosCount'].keys():
        barcode, key_d = k, inp_dict['barPosCount'][k]

        if barcode in inp_dict['pastEnd_d']:
            # nPastEnd are the number of pastEnd hits..
            nPastEnd = inp_dict['pastEnd_d'][barcode]
        else:
            nPastEnd = 0
        
        nTot = nPastEnd

        # Each key is a string  'scf:strnd:pos'
        for j in key_d.keys():
            # readCountlist : [nReads, nGoodReads]
            key, readCountlist = j, key_d[j]
            #nTot increases by the total reads (nReads)
            nTot += readCountlist[0]

        if nTot == 1:
            f1 += 1
        elif nTot == 2:
            f2 += 1

        # total different barcodes (same as len(barPosCount.keys())?)
        totcodes += 1

        if not nTot >= inp_dict['minN']:
            continue

        # barcodes with  enough nReads
        nMulti += 1

        # "at" will be a sorted list of keys based on their 'nReads' (0th index)
        # list is sorted by decreasing order (highest first)
        """
        Notes: key_d is a dict with a specific format:
        {key1: [nReads, nGoodReads], key2: [nReads, nGoodReads, ...}
        where key1, key2, are in format scaffold:strand:position 
            where scaffold is name of scaffold (str), strand is +/-, position is int
        """
        preAt = sorted(key_d.items(), key=lambda j: j[1][0], reverse=True)
        # at is a list of sorted keys 'scaffold:strand:position'
        at = [v[0] for v in preAt] 

        if len(at) == 0:
            # How would this occur?
            nMax = 0
        else:
            # nMax takes the maximum nReads value 
            nMax = key_d[at[0]][0]

        # Adding info to PastEnd
        # if number of Past End reads for the barcode surpass half the Total,
        # or the numbers PastEnd surpass the max reads number for a location
        if float(nPastEnd) >= float(nTot)/2 or nPastEnd >= nMax:
            nInCategory["PastEnd"] += 1
            n2 = nMax
            inp_dict['POOL_FH'].write("\t".join([
                barcode,
                ReverseComplement(barcode),
                str(nTot),
                str(nPastEnd),
                "pastEnd",
                "",
                "",
                str(n2),
                "",
                "",
                "",
                str(nPastEnd) + "\n"
                ]))
            continue

        if not (nMax >= inp_dict['minN'] and \
                float(float(nMax)/float(nTot)) >= inp_dict['minFrac']):
            nInCategory["NoCons"] += 1
            continue
        
        # maxAt is a list [nReads, nGoodReads] with the max nReads of all 
        # related to this key
        maxAt = at[0]

        # Checking unique & qbeg=1 -- but the latter part may be redundant with 
        # maxQBeg
        nGood = key_d[maxAt][1]

        if not (nGood >= inp_dict['minN'] and \
                float(float(nGood)/float(nTot)) >= inp_dict['minFrac']):
            nInCategory["FewGood"] += 1
            continue


        # We consider the next list related to this barcode and key
        nextAt = "::"
        nNext = 0
        if len(at) > 1:
            nextAt = at[1]
            nNext = key_d[nextAt][0]

        # If it's not true that the total number of Reads for the barcode and associated
        # key is greater than the numReads for the barcode and the next highest key
        # multiplied by the "minRatio", then we discard the barcode 
        if not (nMax >= inp_dict['minRatio'] * nNext):
            nInCategory["LoRatio"] += 1
            continue

        # barcodeAt contains the barcodes that passed all the tests.
        # nTot - total number of reads for the barcode
        # nMax - the maximum reads of all locations found
        # maxAt - the list of [nReads, nGoodReads] for that max location (redundant)
        # nNext - the number of reads for the second highest reads location
        # nextAt - the list of [nReads, nGoodReads] for the second highest loc
        barcodeAt[barcode] = [nTot, nMax, maxAt, nNext, nextAt]
        nInCategory["Usable"] += 1
        nReadsForUsable += nTot


    report_str = "\n{} barcodes seen {} or more times. ".format(
                nMulti, inp_dict['minN']) \
                        + " Usable: {}. (minFrac {} minRatio {})".format(
                nInCategory["Usable"], 
                inp_dict['minFrac'],
                inp_dict['minRatio'])

    for category in sorted(nInCategory.keys()):
        if nInCategory[category] > 0:
            report_str += "\n{}\t{}\n{} divided by barcodes seen more than {} times = {}".format(
                category,
                nInCategory[category],
                category,
                inp_dict['minN'],
                nInCategory[category]/ nMulti
                )

    inp_dict["report_dict"]["nUsableBarcodes"] = nInCategory["Usable"]
    inp_dict["report_dict"]["count_bc_report_str"] = report_str
    inp_dict["report_dict"]["nReadsForUsable"] = nReadsForUsable
    logging.info(report_str)

    ret_d = {
        "barcodeAt": barcodeAt,
        "f1": f1,
        "f2": f2,
        "totcodes": totcodes,
        "nReadsForUsable": nReadsForUsable
    }


    return ret_d


def InitPoolFileHandle(poolfile_path):
    # poolfile_path is a string, path to output

    logging.info("Starting to write to Mutant Pool at " + poolfile_path)
    POOL_FH = open(poolfile_path, "w")

    POOL_FH.write("\t".join([
        "barcode",
        "rcbarcode",
        "nTot",
        "n",
        "scaffold",
        "strand",
        "pos",
        "n2",
        "scaffold2",
        "strand2",
        "pos2", 
        "nPastEnd\n",
        ]))

    return POOL_FH


def InitNewVars1():
    """ Initializes variables
    Returns:
        new_vars (d):
            nMapped (int): Total # reads considered
            nSkipQBeg (int): Counts how many queries were skipped because the location 
            barPosCount (d): 
            pastEnd_d (d): (dict) A dictionary mapping barcode of pastEnds to num times seen 
                                If scaffold is "pastEnd" we add it to the pastEnd dict
            report_dict (d): A dict for storing report info.
    

    """
    
    nMapped = 0 # reads considered
    nSkipQBeg = 0 # Counts how many queries were skipped because the location 
    # where the read had a hit to the genome within the query started after 'maxQBeg'

    barPosCount = {} # {barcode => {scaffold:strand:position => 
    #                                [nReads, nGoodReads]}, 
    #                               scaffold:strand:pos => [nRe...]} 
    # barPosCount contains all the different barcodes and has links to all the locations
    # they are found with the number of times each of those occurs

    pastEnd = {} # number of reads for a barcode mapped past the end 
    # (pastEnd reads are not included in barPosCount)

    report_dict = {} # New report dict to convert into HTML table and return to user 

    new_vars = {
            "nMapped": nMapped,
            "nSkipQBeg": nSkipQBeg,
            "barPosCount": barPosCount,
            "pastEnd_d": pastEnd,
            "report_dict": report_dict 
            }

    return new_vars
    



def ProcessInputMapTnSeqTables(inp_dict):
    """
    In this function we run through all the input Map TnSeq tables.
    We count the number of mapped, pastEnd for the barcodes

    inp_dict: (dict)

        map_tnseq_table_fps: (list of strings (filepaths))
        pastEnd_d: (dict) A dictionary mapping barcode of pastEnds to num times seen 
            If scaffold is "pastEnd" we add it to the pastEnd dict
        maxQBeg: (int) maximum position in Query sequence for which good reads
            can be found. e.g. 35 would mean a hit found at pos 36 or higher 
                wouldn't count
        barPosCount: (dict) A dict which maps to subdicts with each subdict 
            having keys (scf:strnd:pos) which maps to a list with [nReads, nGoodReads]
            So barcode to locations with number of Reads found in each location
        nMapped: (int) counts total number of reads mapped -starts as 0
        nSkipQBeg: (int) Counts how many queries were skipped because the location
            where the read had a hit to the genome within the query started after 'maxQBeg'
        report_dict: (dict) Dict containing entire report for the process.

    Description:
        Every output table from Map Tn Seq has the following columns:
            read_name (from FASTQ)
            barcode (nt string)
            scaffold (from genome)
            position 
            strand
            unique (1 if yes, 0 if no, uniqueness refers to location, not number of reads).
            query beginning loc
            query end location
            bit score
            percent identity

        We add the info from the tables to dicts
    """
    logging.info("Starting to read MapTnSeq Output Tables:\n" \
            + "\n".join(inp_dict['map_tnseq_table_fps']))

    tot_line_num = 0
   
    # We run through all the Map Tn Seq tables and count barcodes
    for MTS_fp in inp_dict['map_tnseq_table_fps']:
        logging.info("Reading " + MTS_fp)
        MTS_FH = open(MTS_fp,"r")

        c_line = MTS_FH.readline()
        while c_line != '':
            tot_line_num += 1
            c_line = c_line.rstrip('/n')

            # read, barcode, scaffold (from genome), position (in scaffold), 
            # strand ( +/- ), unique (besthits list was length 1), query Beginning location,
            # query End location, bit score, percent identity
            read, bc, scf, pos, strnd, unq, qB, qE, scr, idn = c_line.split('\t')
            if scf == "pastEnd":
                if bc in inp_dict['pastEnd_d']:
                    inp_dict['pastEnd_d'][bc] += 1
                else:
                    inp_dict['pastEnd_d'][bc] = 1

            # maxQBeg can be as small as 3
            elif inp_dict['maxQBeg'] >= 1 and float(qB) <= inp_dict['maxQBeg']:
                key = ":".join([scf, strnd, pos])
                UpdateBarPosCount(inp_dict['barPosCount'], bc, key, unq, qB) 
                inp_dict['nMapped'] += 1
            else:
                inp_dict['nSkipQBeg'] += 1

            c_line = MTS_FH.readline()

        MTS_FH.close()

    # First line of DRP report needs no new-line
    report_str = "Read {} mapped reads for {} distinct barcodes.".format(
                inp_dict['nMapped'],
                len(inp_dict['barPosCount'].keys()))
    report_str += "\nSkipped {} reads with qBeg > {}".format(
                inp_dict['nSkipQBeg'],
                inp_dict['maxQBeg'])
    inp_dict["report_dict"]["input_process_info"] = report_str
    inp_dict["report_dict"]["total_MTS_table_lines"] = tot_line_num
    inp_dict["report_dict"]["nMapped"] = inp_dict['nMapped']
    logging.info(report_str)

    # Main vars used in the future are barPosCount and pastEnd_d



def UpdateBarPosCount(barPosCount, barcode, key, unique, qBeg):
    """
    Description:
        barPosCount is a dict that maps barcodes to a location dict,
        the location dict keys are strings that look like scf:strnd:pos,
        each location key maps to a list [int, int], which represents
        [how many barcodes found in this location, how many unique and good barcodes found in this location]

    This function is used to update the dict in a specific way.
    Should there be a limit to the size of barPosCount? Memory problems?


    barPosCount: (dict)
    barcode: (str)
    key: (str) scf:strnd:pos (scaffoldId:+/-:int)
    unique: (str) string of int (0 or 1); 0 meaning not unique, and 1 meaning yes unique
    qBeg: (str) string of int, a good qBeg is between 1 and 3 (inclusive)

    note barPosCount contains all lines in any MapTnSeq table with the 
        same scaffold-strand-position value for a specific barcode
    """
    # 'good query Beginning'
    gd_qB = ["1","2","3"]
    if barcode in barPosCount:
        if key in barPosCount[barcode]:
            barPosCount[barcode][key][0] += 1
            if unique == "1" and qBeg in gd_qB:
                barPosCount[barcode][key][1] += 1
        else:
            if unique == "1" and qBeg in gd_qB:
                barPosCount[barcode][key] = [1,1]
            else:
                barPosCount[barcode][key] = [1,0]
    else:
        if unique == "1" and qBeg in gd_qB:
            barPosCount[barcode] = {key : [1,1]}
        else:
            barPosCount[barcode] = {key : [1,0]}




def ReverseComplement(barcode):
    """
    barcode: (str) just "A""C""T""G"
    We return reverse complement: ACCAGT -> ACTGGT
    """
    revc_bc = ""
    barcode = barcode.upper()
    transl_d = {"A":"T","C":"G","T":"A","G":"C"}
    for char in barcode:
        if char not in ["A","C","T","G"]:
            raise Exception("char {} not in ACTG as expected".format(char))
        else:
            revc_bc += (transl_d[char])

    return revc_bc[::-1]
            


def Variants(barcode):
    """
    barcode: (str) a string of a DNA sequence
    """
    out = []
    baseseq = barcode.upper()

    for i in range(len(baseseq)):
        pre = baseseq[0:i]
        char = baseseq[i]
        post = baseseq[i+1:]
        if not char in ["A","C","G","T"]:
            continue
        for c in ["A","C","G","T"]:
            if not char == c:
                out.append(pre + c + post)

    return out





def test():

    return None




def main():

    args = sys.argv
    if args[-1] == "1":
        #main test
        pass
    elif args[-1] == "2":
        # Rlog_d test
        rlog_fp = args[1]
        RlogToDict(rlog_fp)


    return None

if __name__ == "__main__":
    main()
