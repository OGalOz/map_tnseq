#!python3

import os
import sys
import logging
import json
import math


"""
    Recently replaced all "Standard Deviation Ratio" labelling to "Z score" labelling
"""

def PosScfBCDataToZScrPointsForValues(PosScfBC_fp, op_fp, analysis_type):
    """We convert Data from the format PosScfBC.schema.json to Scf_Pos_ZScr_vals

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

     Args:
        PosScfBC_fp: (str)
        op_fp: (str)
        analysis_type: (str) 0 or 1 0 -> Total analysis, 1-> individual scaffolds analysis

     Returns:
        Scf_Pos_ZScr_vals: (dict)
            experiment_id: string
            organism_name: string
            analysis_type: (str) "AllGenomeStats" or "IndividualScaffoldStats"
            [mean]: float (optional, exists if AllGenomeStats)
            [SD]: float (optional, exists if AllGenomeStats)
            [max_z]: float (optional, exists if AllGenomeStats)
            scaffolds: scaffold_d (d)
                scaffold_d:
                scaffold -> pos_to_Zscr_d (dict) 
                    pos_to_Zscr_d: (d)
                        scaffold_length: (int)
                        mean: (float) mean of this scaffold specifically
                        SD: (float) Standard Deviation of this scaffold specifically
                        max_z: (float) The maximum z score value for any of the value_tuples
                                        listed below.
                        pos_to_Zscr_l: list<value_tuple>
                            value_tuple: (list) [position (int), z-score (float)]
    """
    with open(PosScfBC_fp, "r") as f:
        PosScfBC_d = json.loads(f.read())
   
    if analysis_type == "0":
        Scf_Pos_ZScr_vals = GetZScrInfoForAllScaffolds(PosScfBC_d)
    elif analysis_type == "1":
        Scf_Pos_ZScr_vals = GetZScrInfoForIndividualScaffolds(PosScfBC_d)
    else:
        raise Exception("Did not recognize analysis type")

    with open(op_fp, "w") as f:
        f.write("window.MH_data = " + json.dumps(Scf_Pos_ZScr_vals))

    logging.info("Wrote Scaffold to Position-ZScr value list at " + op_fp)


def GetZScrInfoForIndividualScaffolds(PosScfBC_d):

    """We calculate the ZScr over the individual scaffolds in the genome
    
    Input is the same as to the function PosScfBCDataToZScrPointsForValues above.

    """
    Scf_Pos_ZScr_vals = {"scaffolds": {}}

    for scf_name in PosScfBC_d["scaffolds"].keys():
        scf_info = PosScfBC_d["scaffolds"][scf_name]

        pos_and_nIns_l = [[int(x), scf_info["positions"][x]["nIns"]] for x in \
                scf_info["positions"].keys()]


        mean, SD, max_z, pos_to_Zscr_l = GetSdPointsForValues(pos_and_nIns_l)

        Scf_Pos_ZScr_vals["scaffolds"][scf_name] = {
                "scaffold_length": scf_info["scaffold_length"],
                "mean": mean,
                "SD": SD,
                "max_z": max_z,
                "pos_to_Zscr_l": pos_to_Zscr_l
        }
    Scf_Pos_ZScr_vals["analysis_type"] = "IndividualScaffoldStats"

    return Scf_Pos_ZScr_vals

    

def GetZScrInfoForAllScaffolds(PosScfBC_d):
    """We calculate the ZScr over all the insertions for the genome
    
    Instead of calculating SD and mean for each scaffold, we calculate
        these stats over the entire genome. We return information without
        the values with Standard Deviations below 0 to minimize size of
        JSON file.

    Input is the same as to the function PosScfBCDataToZScrPointsForValues above.


    Output is different, in that there is one mean, one SD, and the other data
        varies per scaffold


    
    """
    total_pos_and_nIns_l = []

    # We initially run through the scaffolds to get SD, mean
    for scf in PosScfBC_d["scaffolds"].keys():
        scf_info = PosScfBC_d["scaffolds"][scf]
        pos_and_nIns_l = [[int(x), scf_info["positions"][x]["nIns"]] for x in \
                scf_info["positions"].keys()]
        total_pos_and_nIns_l += pos_and_nIns_l


    just_insertions_l = [x[1] for x in total_pos_and_nIns_l]
    mean = float(sum(just_insertions_l))/float(len(just_insertions_l))

    SD = GetStandardDeviation(just_insertions_l, mean)


    Scf_Pos_ZScr_vals = {"scaffolds": {}}
    total_max_z = 0
    # Now we run through the scaffolds again to get relation of values to total
    # SD and mean and store them in output dict
    for scf in PosScfBC_d["scaffolds"].keys():
        scf_info = PosScfBC_d["scaffolds"][scf]
        pos_and_nIns_l = [[int(x), scf_info["positions"][x]["nIns"]] for x in \
                scf_info["positions"].keys()]
        scf_max_z, pos_to_Zscr_l = GetZScrValuesForPoints(pos_and_nIns_l, mean, SD)
        if scf_max_z > total_max_z:
            total_max_z = scf_max_z

        Scf_Pos_ZScr_vals["scaffolds"][scf] = {
                "scaffold_length": scf_info["scaffold_length"],
                "max_z": scf_max_z,
                "pos_to_Zscr_l": pos_to_Zscr_l
        }



    Scf_Pos_ZScr_vals["mean"] = mean
    Scf_Pos_ZScr_vals["SD"] = SD
    Scf_Pos_ZScr_vals["max_z"] = total_max_z
    Scf_Pos_ZScr_vals["analysis_type"] = "AllGenomeStats"

    return Scf_Pos_ZScr_vals
        







def GetSdPointsForValues(pos_and_nIns_l):
    """ We take position and num insertion values and get ZScrs for each
    Args:
        pos_and_nIns_l: list<value_tuple>
            value_tuple: (list) [position (int), number_of_insertions (int)]
    Returns:
        mean: (float)
        SD: Standard Deviation (float)
        max_z: (float) The highest Standard Deviation value for any of them
        pos_to_Zscr_l: list<value_tuple>
            value_tuple: (list) [position (int), ZScr_val (float)]
        

    """
    just_insertions_l = [x[1] for x in pos_and_nIns_l]
    mean = float(sum(just_insertions_l))/float(len(just_insertions_l))

    SD = GetStandardDeviation(just_insertions_l, mean)

    max_z, pos_to_Zscr_l = GetZScrValuesForPoints(pos_and_nIns_l, mean, SD)

    return mean, SD, max_z, pos_to_Zscr_l

    
def GetZScrValuesForPoints(pos_and_nIns_l, mean, SD): 
    """ We take position and num insertion values and get ZScrs for each
    Args:
        pos_and_nIns_l: list<value_tuple>
            value_tuple: (list) [X (int) (position), y (int) (num insertions)]
        mean: float
        SD: float (standard deviation)
    Returns:
        list<max_z, pos_to_Zscr_l>
            max_z: float
            pos_to_Zscr_l: list [ (int) position, ZScr (float) ]
        
    """

    if SD == 0.0:
        return [0,[]]

    pos_to_ZScrs_list = []
    max_z_scr = 0

    for tup in pos_and_nIns_l:
        Zscr = float(tup[1] - mean)/float(SD)
        pos_to_ZScrs_list.append([tup[0], Zscr])

        if Zscr > max_z_scr:
            max_z_scr = Zscr


    return [max_z_scr, pos_to_ZScrs_list]


def GetZValue(vals_l, hypothesis_mean):

    true_mean = sum(vals_l)/len(vals_l)
    SD = GetStandardDeviation(vals_l)

    return (true_mean - hypothesis_mean)/(SD/math.sqrt(len(vals_l)))



def GetStandardDeviation(vals_l, mean):
    """ We get the Standard Deviation from a list of values

    Args:
        vals_l: (list<int/float>) The values.
        mean: (float) The mean of vals_l (sum/length)

    """


    sum_deviations_squared = 0

    for x in vals_l:
        sum_deviations_squared += (x - mean)**2

    return math.sqrt(float(sum_deviations_squared)/float(len(vals_l)))
    

def GetAllMaxValuesAndLoc(Scf_Pos_ZScr_vals_fp):
    """
    Args:

        Scf_Pos_ZScr_vals_fp: (str) (Filepath)

        Scf_Pos_ZScr_vals: (dict)
        scaffold -> pos_to_Zscr_d (dict) 
            pos_to_Zscr_d: (d)
                mean: (float)
                SD: (float)
                pos_to_Zscr_l: list<value_tuple>
                    value_tuple: (list) [position (int), ZScr_val (float)]
    """
   
    with open(Scf_Pos_ZScr_vals_fp,"r") as f:
        Scf_Pos_ZScr_vals = json.loads(f.read())

    max_values_d = {}

    for scf_n in Scf_Pos_ZScr_vals.keys():
        pos_to_Zscr_d = Scf_Pos_ZScr_vals[scf_n]
        resp = GetMaxValueFromScaffold(pos_to_Zscr_d)
        max_values_d[scf_n] = resp

    print(max_values_d)





def GetMaxValueFromScaffold(pos_to_Zscr_d):
    """
    Args:
       pos_to_Zscr_d: (d)
           mean: (float)
           SD: (float)
           pos_to_Zscr_l: list<value_tuple>
               value_tuple: (list) [position (int), ZScr_val (float)]

    Returns:
        [loc (int), value (int), ZScr_val (float)]
    """

    max_z = -1
    max_loc = -1

    cvs = pos_to_Zscr_d["pos_to_Zscr_l"]
    for i in range(len(cvs)):
        if cvs[i][1] > max_z:
            max_z = cvs[i][1]
            max_loc = cvs[i][0]

    value = pos_to_Zscr_d["mean"] + (pos_to_Zscr_d["SD"] * max_z)

    return [max_loc, value, max_z]







def test():

    return None


def main():
    
    args = sys.argv
    if args[-1] == "help" or args[-1] == "how":
        help_str = "python3 ScfPosBC_to_MhtnData.py ScfPosBCvals_fp op_fp 0\n"
        help_str += "Above gives you analysis over entire genome, not individual scaffolds"
        help_str += "\nOR\n"
        help_str += "python3 ScfPosBC_to_MhtnData.py ScfPosBC_fp op_fp 1\n"
        help_str += "Above gives you analysis over individual scaffolds"
        print(help_str)
        sys.exit(0)
    elif args[-1] in ["0", "1"]:
        logging.basicConfig(level=logging.DEBUG)
        PosScfBCDataToZScrPointsForValues(args[1], args[2], args[3])
    else:
        raise Exception("Did not recognize input, try running 'python3 filename help'")

    return None

if __name__ == "__main__":
    main()
