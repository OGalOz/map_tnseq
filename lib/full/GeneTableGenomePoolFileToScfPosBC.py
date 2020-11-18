#!python3
# Edited Aug 27th 2020

import os
import sys
import logging
import json
import statistics


def GeneTable_Barcodes_To_BarcodeGenes(gt_fp, poolfile_fp, genome_fna_fp, op_fp, organism_name, experiment_id):
    """
    Args:
        gt_fp: (str) Path to gene table file (TSV)
            locusId (str):sysName (str):type (int):scaffoldId (str):begin (int):end (int):
                strand (str +/-):name (str):desc (str):GC (float [0,1]):nTA (int)

        poolfile_fp: (str) Path to pool file, TSV file
           barcode(str):rcbarcode(str):nTot(int):n(int):scaffold(str):strand(str +/-):pos(int):
           n2(int):scaffold2(int):strand2(str +/-):pos2(int):nPastEnd(int)

        genome_fna_fp: (str) Path to FASTA file with >scaffold_names then sequence
            We use this for length of each scaffold

        op_fp: (str) Path to Output TSV File with
            barcode(str):scaffold(str):strand(str +/-):gene_start(int):gene_end(int):insertion_loc_within_gene(int):
                gene_function(str)

        organism_name: (str) Name of organism

    Returns:
        Writes out to file a JSON described in "WriteScaffoldPositionBarcodesFile"




    What do we want this file to contain: For all barcodes:
    """

    # Then, for each line in the poolfile, we check if the insertion is between beginning and end of some gene.
    # If it is, we add it to an output file 

    ScaffoldGene_d = GeneTableToScaffoldGeneDict(gt_fp)

    WriteScaffoldPositionBarcodesFile(ScaffoldGene_d, poolfile_fp, genome_fna_fp, 
                                    op_fp, organism_name, experiment_id)



def WriteScaffoldPositionBarcodesFile(ScaffoldGene_d, poolfile_fp, genome_fna_fp, 
                                    op_fp, organism_name, experiment_id):
    """

    Args:
        ScaffoldGene_d: (dict) Only connects Scaffolds and Genes, no barcodes
            scaffold (str) -> gene_info_list list<gene_info_1>
                gene_info_1: {begin: int , end: int , strand: "+"/"-" , desc: (str) }

        poolfile_fp: (str) Path to pool file, TSV file
           barcode(str):rcbarcode(str):nTot(int):n(int):scaffold(str):strand(str +/-):pos(int):
           n2(int):scaffold2(int):strand2(str +/-):pos2(int):nPastEnd(int)


        genome_fna_fp: (str) Path to FASTA file with >scaffold_names then sequence
            We use this for length of each scaffold

        op_fp: (str) Path to file: Mapping all different scaffolds to barcodes inserted within them
            
            JSON FILE: dict of
                    organism_name: (str)
                    experiment_id: (str)
                    scaffolds: (d)
                        scaffold_name (str): -> scaffold_info_d (d)
                            scaffold_info_d:
                                    scaffold_name: (str)
                                    scaffold_length: (int)
                                    positions: (d)
                                        barcode_pos (str<int>) -> pos_d (d)
                                            pos_d:
                                                nIns: (i) A count of insertions at position, for both strands
                                                ["+"]: strand_info_d
                                                    strand_info_d: (d)
                                                        barcodes: list<barcode_str (s)> String of barcode
                                                            e.g. "ACCAATTT..." length 20.
                                                        [genes]: gene_id_dict (d)
                                                            gene_id -> gene_info_d
                                                                gene_info_d:
                                                                    gene_pos_in_scaffold: (str) begin:end e.g. 
                                                                        2345:3456
                                                                    bc_pos_within_gene: (int) location of 
                                                                        barcode within the gene
                                                                    gene_length: (int)
                                                                    bc_loc_percent_within_gene: (float) Starting 
                                                                        position of insertion within gene
                                                                    gene_desc: (str) Description of Gene
                                                ["-"]: strand_info_d
    """
    
    # Dict of Scaffold Name (str) -> scaffold length (int)
    Scaffold_To_Length = GetScaffoldLengths(genome_fna_fp)

    Pool_FH = open(poolfile_fp, "r")
    pool_header_line = Pool_FH.readline().rstrip()
    CheckPoolHeaderLine(pool_header_line, poolfile_fp)

    c_line = Pool_FH.readline().rstrip()
    line_num = 1

    ScfPosBC_d = {"organism_name": organism_name, 
            "experiment_id": experiment_id}
    scaffolds_info_dict = {}

    while c_line != "":
        line_num += 1
        c_list = c_line.split('\t')
        if len(c_list) != 12:
            raise Exception("Expecting 12 TSVs from poolfile line, " \
                            + "instead got {}. Line # {}. Poolfile:\n {}".format(len(c_list), 
                                                                                line_num,
                                                                                poolfile_fp))
        # These are the values from the pool file
        barcode, scaffold, strand= c_list[0], c_list[4], c_list[5]

        if scaffold == "PastEnd" or scaffold == "pastEnd":
            c_line = Pool_FH.readline().rstrip()
            continue

        pos = int(c_list[6]) if c_list[6] != "" else ""

        genes_insertion_dict = {"+": {}, "-": {}}
        if scaffold in ScaffoldGene_d:
            # genes_insertion_dict is divided into positive strand and negative strand
            genes_insertion_dict = FindBarcodeInGenes(barcode, scaffold, strand, pos, ScaffoldGene_d)

        # Here we update the scaffolds info dict, there are a lot of routes we can go
        if scaffold in scaffolds_info_dict:
            if str(pos) in scaffolds_info_dict[scaffold]["positions"]:
                crnt_pos_d = scaffolds_info_dict[scaffold]["positions"][str(pos)]
                crnt_pos_d["nIns"] += 1

                if strand in crnt_pos_d:
                    if "barcodes" in crnt_pos_d[strand]:
                        crnt_pos_d[strand]["barcodes"].append(barcode)
                    else:
                        crnt_pos_d[strand]["barcodes"] = [barcode]
                else:
                    crnt_pos_d[strand] = {"barcodes": [barcode]}

                for x in ["+", "-"]:
                    if x in crnt_pos_d:
                        if x in genes_insertion_dict and len(genes_insertion_dict[x].keys()) > 0:
                            if "genes" in crnt_pos_d[x]:
                                crnt_pos_d[x]["genes"].update(genes_insertion_dict[x])
                            else:
                                crnt_pos_d[x]["genes"] = genes_insertion_dict[x]
                    else:
                        if x in genes_insertion_dict and len(genes_insertion_dict[x].keys()) > 0:
                            crnt_pos_d[x] = {"genes": genes_insertion_dict[x]}
            else:
                crnt_pos_d = {
                            "nIns": 1,
                            strand: {"barcodes": [barcode]}
                            }

                for x in ["+", "-"]:
                    if x in crnt_pos_d:
                        if x in genes_insertion_dict and len(genes_insertion_dict[x].keys()) > 0:
                            crnt_pos_d[x]["genes"] = genes_insertion_dict[x]
                    else:
                        if x in genes_insertion_dict and len(genes_insertion_dict[x].keys()) > 0:
                            crnt_pos_d[x] = {"genes": genes_insertion_dict[x]}

            scaffolds_info_dict[scaffold]["positions"][str(pos)] = crnt_pos_d
        else:
            crnt_pos_d = {"nIns": 1,
                        strand: {"barcodes": [barcode]}
                        }
            for x in ["+", "-"]:
                if x in crnt_pos_d:
                    if x in genes_insertion_dict and len(genes_insertion_dict[x].keys()) > 0:
                        crnt_pos_d[x]["genes"] = genes_insertion_dict[x]
                else:
                    if x in genes_insertion_dict and len(genes_insertion_dict[x].keys()) > 0:
                        crnt_pos_d[x] = {"genes": genes_insertion_dict[x]}

            scaffolds_info_dict[scaffold] = {
                    "scaffold_name": scaffold,
                    "positions": {
                        str(pos): crnt_pos_d
                        }
                    }
            
        c_line = Pool_FH.readline().rstrip()


    Pool_FH.close()

    # Adding scaffold lengths
    for scf in scaffolds_info_dict.keys():
        if scf in Scaffold_To_Length:
            scaffolds_info_dict[scf]["scaffold_length"] = Scaffold_To_Length[scf]
        else:
            raise Exception("Couldn't find scaffold {} in genome fna {}".format(
                scf, genome_fna_fp))

    ScfPosBC_d["scaffolds"] = scaffolds_info_dict

    with open(op_fp, "w") as f:
        f.write(json.dumps(ScfPosBC_d))

    print("Wrote Scaffolds Insertion Pos Dict to " + op_fp)

    return None

def GetScaffoldLengths(genome_fna_fp):
    """ This function gets the lengths of the scaffolds, returns a dict

    Args:
        genome_fna_fp: (str) Path to genome fna file (FASTA)

    Returns:
        Scaffold_To_Length: (dict) 
            scaffold_name: (str) -> length (int)
    """

    Scaffold_To_Length = {}

    FNA_FH = open(genome_fna_fp)

    c_line = FNA_FH.readline().strip()
    c_scaffold_name = ""
    while c_line != "":
        if c_line[0] == ">":
            if c_scaffold_name != "":
                Scaffold_To_Length[c_scaffold_name] = cs_len
            c_scaffold_name = c_line[1:]
            # Current scaffold length is reset
            cs_len = 0
        else:
            cs_len += len(c_line)

        c_line = FNA_FH.readline().strip()

    FNA_FH.close()

    if c_scaffold_name != "":
        Scaffold_To_Length[c_scaffold_name] = cs_len

    if len(Scaffold_To_Length.keys()) == 0:
        logging.warning("No Scaffolds found in " + genome_fna_fp)

    return Scaffold_To_Length


def GetScaffoldStatistics(Scaffold_d, scaffold_name):
    """
    Args:
        Scaffold_d: (d)
            barcode_pos -> list<barcode_d>
        scaffold_name: (s)

    Returns:
        stat_str: (s)
    """

    num_insertions_per_location = []

    for position in Scaffold_d.keys():
        num_insertions_per_location.append(len(Scaffold_d[position]))

    stat_str = "Scaffold: {}\n".format(scaffold_name)
    stat_str += "Max val: {}\n".format(max(num_insertions_per_location))
    stat_str += "Average val: {}\n".format(sum(num_insertions_per_location)/len(num_insertions_per_location))
    stat_str += "Mode: {}\n\n".format(statistics.mode(num_insertions_per_location))

    return stat_str



def FindBarcodeInGenes(barcode, scaffold, strand, pos, ScaffoldGene_d):
    """
    Finds Genes in Which Barcode is located. Note we checked scaffold in ScaffoldGene_d
    
    Args:
        barcode: (str) 20 nucleotides ACTG
        scaffold: (str) Name of scaffold
        strand: (str) +/-
        pos: (int) Position of barcode within scaffold
        ScaffoldGene_d: (dict)
            scaffold (str) -> [{begin: int , end: int , strand: "+"/"-" , desc: (str), id: (str) }, {beg... }]

    Returns:
        genes_insertion_dict: "+" and "-" strands are optional keys.
            ["+"]: gene_id_dict (d) 
                gene_id -> bc_gene_info_d
                    bc_gene_info_d:
                        gene_pos_in_scaffold: (str) begin:end e.g. 2345:3456
                        bc_pos_within_gene: (int) location of barcode within the gene
                        gene_length: (int)
                        bc_loc_percent_within_gene: (float) Starting position of insertion within gene
                        gene_desc: (str) Description of Gene
            ["-"]: gene_id_dict (d) 
    """


    genes_insertion_dict = {"+":{}, "-":{}}

    # We previously checked if scaffold is indeed in ScaffoldGene_d 
    scaffold_gene_list = ScaffoldGene_d[scaffold]

    for gene_info in scaffold_gene_list:
        if pos >= gene_info["begin"] and pos <= gene_info["end"]:
            bc_gene_info_d = {
                "gene_pos_in_scaffold": str(gene_info["begin"]) + ":" + str(gene_info["end"]),
                "bc_pos_within_gene": pos - gene_info["begin"],
                "gene_length": gene_info["end"] - gene_info["begin"],
                "bc_loc_percent_within_gene": float(pos - gene_info["begin"])/\
                        float(gene_info["end"] - gene_info["begin"]),
                "gene_desc": gene_info["desc"]
            }
            genes_insertion_dict[gene_info["strand"]][gene_info["id"]] = bc_gene_info_d

    return genes_insertion_dict



def CheckPoolHeaderLine(pool_header_line, pool_fp):
    # Both inputs string, pool_header_line should have no new line symbol

    expPoolHeader = "barcode\trcbarcode\tnTot\tn\tscaffold\tstrand\tpos\t" \
                   + "n2\tscaffold2\tstrand2\tpos2\tnPastEnd"
    if not pool_header_line == expPoolHeader:
        raise Exception("Pool Header line not as expected. " \
                + "Expecting:\n{}\nGot:\n{}\n File: {}".format(
            expPoolHeader, pool_header_line, pool_fp))


def GeneTableToScaffoldGeneDict(gt_fp):
    """
    Args:
        gt_fp: (str) Path to gene table file (TSV)
            locusId (str):sysName (str):type (int):scaffoldId (str):begin (int):end (int):
                strand (str +/-):name (str):desc (str):GC (float [0,1]):nTA (int)
    Returns:
        ScaffoldGene_d: (dict)
            scaffold (str) -> gene_info_list list<gene_info_1>
                gene_info_1: {begin: int , end: int , strand: "+"/"-" , desc: (str), id: (str) }
    """

    # Gene Table File Handle
    GT_FH = open(gt_fp, "r")

    header_line = GT_FH.readline().rstrip()
    
    #Check header_line:
    #Check_GT_Header(header_line, gt_fp)

    ScaffoldGene_d = {}

    c_line = GT_FH.readline().rstrip()
    line_num = 1
    while c_line != "":
        line_num += 1
        gene_line_list = c_line.split("\t")
        """
        if len(gene_line_list) != 11:
            raise Exception("Gene Table {} has odd number of TSVs {} at line # {}".format(
                gt_fp, len(gene_line_list), line_num))
        """


        gll = gene_line_list
        # scaffold is index 3, begin 4, end 5, strand 6, desc 8
        scaffold, begin, end, strand, desc = gll[3], gll[4], gll[5], gll[6], gll[8]
        if scaffold in ScaffoldGene_d:
            scaffold_gene_list = ScaffoldGene_d[scaffold]
            gene_id = scaffold + "|g_" + str(len(scaffold_gene_list) + 1)
            ScaffoldGene_d[scaffold].append({
                                            "begin": int(begin),
                                            "end": int(end),
                                            "strand": strand,
                                            "desc": desc,
                                            "id": gene_id})
        else:
            ScaffoldGene_d[scaffold] = [{
                                            "begin": int(begin),
                                            "end": int(end),
                                            "strand": strand,
                                            "desc": desc,
                                            "id": scaffold + "|g_1"}]

        c_line = GT_FH.readline().rstrip()

    GT_FH.close()

    if len(ScaffoldGene_d.keys()) == 0:
        logging.warning("No genes in gene table: " + gt_fp)

    return ScaffoldGene_d




def Check_GT_Header(header_line, gt_fp):
    """
    Args:
        header_line: (str)
        gt_fp: (str) Path to gene table file
    """

    # expected Header Line
    expHL = "locusId\tsysName\ttype\tscaffoldId\tbegin\tend\tstrand\tname\tdesc\tGC\tnTA"

    if not header_line == expHL:
        raise Exception("Header line for {} not as expected".format(gt_fp))

    return None


def test(test_val, args_list):
    """
    Args: 
        test_val: (int) represents which test
        args_list: (list) contains args 
    """
    if test_val == 1:
        res_d = GeneTableToScaffoldGeneDict(args_list[1])
        with open("tmp/gt_d.json", "w") as f:
            f.write(json.dumps(res_d, indent=4))
        print("Wrote GT_d to tmp/gt_d.json")
        sys.exit(0)

    elif test_val == 2:
        # gene table
        gt_fp = args_list[1]
        # pool file
        poolfile_fp = args_list[2]
        # genome.fna
        genome_fna_fp = args_list[3]
        # output
        op_fp = args_list[4]
        # string organism name
        organism_name = args_list[5]
        # string experiment id
        experiment_id = args_list[6]

        GeneTable_Barcodes_To_BarcodeGenes(gt_fp, poolfile_fp, genome_fna_fp, op_fp, organism_name,
                experiment_id)
        sys.exit(0)

    return None

def main():

    args = sys.argv
    if args[-1] == "how" or args[-1] == "help":
        how_str = "python3 GeneTableGenomePoolFileToDisplay.py InputGeneTable.GC 1\nOR\n"
        how_str += "python3 GeneTableGenomePoolFileToDisplay.py InputGeneTable.GC pool_fp genome_fna_fp op_fp organism_name experiment_id 2\n"
        print(how_str)
        sys.exit(0)
    elif args[-1] == "1":
        test(1, args)
    elif args[-1] == "2":
        test(2, args)

    else:
        raise Exception("Cannot recognize inputs. try \npython3 GeneTableGenomePoolFileToDisplay.py how")

    return None

if __name__ == "__main__":
    main()
