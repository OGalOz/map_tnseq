#!python3

import os
import sys
import logging
import json
import random
import shutil


"""
    Notes:
        "Expanding Bar Chart" will be shortened to "EBC"
        
    TD:
        Run and test output 
    
    We want it so the BasePair-values never go beyond 3 digits (?)
    Switch from Mbp, to Kbp, to bp, and at the highest Gbp 
    
    We serve the data that has values over 1000, and let javascript on the browser
        compute the lower values from a dict.

"""


def ScfPosBC_Info_To_Scaffolds(ScfPosBC_fp, tick_range_threshold, gene_table_fp, genome_fna_fp, op_dir):
    """ We convert an insertion data format to the visualization format

    We will create a single data file with each scaffold name pointing to
    a "ticks_data" object.


    These are both necessary for the visualization to work properly

    Args:
        All_Info_d:
            organism_name: (str) 
            experiment_id: (str)
            scaffold_name -> scaffold_inp_d (without the scaffold_name key)
                scaffold_inp_d:
                Args shown in function "Scaffold_to_Data_Viz_d" except
                    for we need to add scaffold_name key to dict
    """


    # First, we prepare the genes info
    scf_len_d, scf_seq_d = GetScaffoldLengths(genome_fna_fp)
    scf_locs_d, scf_gene_id_d = GenesTableToLocsDict(gene_table_fp, scf_len_d)
    # Each of above dicts scf_locs_d & scf_gene_id_d are divided into scaffolds by scf_name

    with open(ScfPosBC_fp, "r") as f:
        All_Info_d = json.loads(f.read())

    if not os.path.exists(op_dir):
        raise Exception("Output directory does not exist yet. Please create it first.")


    #complete_ticks_data_d = {"organism_name": All_Info_d["organism_name"],
    #        "experiment_id": All_Info_d["experiment_id"], "scaffolds": {}}

    
    scf_name_to_fp_d = {}

    for scaffold_name in All_Info_d["scaffolds"].keys():

        print("Working on printing " + scaffold_name)

        # We initialize the output dict
        scf_EBC_data = {}

        # shortening for ease of writing - current dict
        crt_d = All_Info_d["scaffolds"][scaffold_name]
        # We remove the "genes" key from crt_d
        RemoveGenesKeyFromDict(crt_d)


        """
        with open(os.path.join(op_dir, fn_scf_name), "w") as f:
            f.write(fixed_scf_name + " = " + json.dumps(crt_d))
        """


        """
        scaffold_print = scaffold_name.replace('/','_')
        with open(os.path.join(op_dir, scaffold_print + "_data_viz_d.json"), "w") as f:
            f.write("data_viz_d = " + json.dumps(crt_d))
        """


        crnt_scf_len = crt_d["scaffold_length"]

        # Creating ticks data  
        loc_to_bar_data_d = {}
        # Creating pos to count dict
        pos_to_count = {x:crt_d["positions"][x]["nIns"] for x in crt_d["positions"].keys()}
        GetTicksFromStartandEnd( 0, crnt_scf_len , loc_to_bar_data_d, 
                            pos_to_count, True, tick_range_threshold)

        crt_d.pop("scaffold_name", None)
        crt_d.pop("scaffold_length", None)
        
        scf_EBC_data_d = {
                "tick_range_threshold": tick_range_threshold,
                "loc_to_bar_data": loc_to_bar_data_d,
                "pos_to_insertion_num_and_barcodes_d": crt_d["positions"],
                "scaffold_length": crnt_scf_len,
                "gene_loc_list": scf_locs_d[scaffold_name],
                "gene_ids_to_desc_and_layers_d": scf_gene_id_d[scaffold_name],
                "scaffold_sequence": scf_seq_d[scaffold_name]
                }

        # This sets the name of the file: VERY IMPORTANT SHIFT
        fixed_scf_name = scaffold_name.replace("/","_").replace(" ", "_")
        fn_scf_name = fixed_scf_name + "_EBC_data.js"

        # Now we write out scf_EBC_data_d
        with open(os.path.join(op_dir, fn_scf_name), "w") as f:
            f.write("window." + fixed_scf_name + "EBC = " + json.dumps(scf_EBC_data_d))

        # complete_ticks_data_d["scaffolds"][scaffold_name] = full_tick_data_d

        # Below we keep track of scaffold name to the file name so
        # we can access it when needed
        scf_name_to_fp_d[fixed_scf_name] = fn_scf_name


    """
    with open(os.path.join(op_dir, "ticks_data.js"), "w") as f:
        f.write("ticks_data_d = " + json.dumps(complete_ticks_data_d))
    """

    with open(os.path.join(op_dir, "EBC_Scaffolds_Init_Data.js"), "w") as f:
        f.write("window.ebcScfInit = " + json.dumps(scf_name_to_fp_d, indent=2))




def RemoveGenesKeyFromDict(inp_d):
    """
    In this function we do a few funcs:
        1. Remove the "genes" key from strand sub dicts
        2. Remove empty strand dicts once "genes" key is removed
        3. Move "barcodes" up one level so there is no longer a barcodes key

    the input dict, which looks like:
    inp_d: (d)
        scaffold_name: (str)
        scaffold_length: (int)
        positions: (d)
            position str<int> -> pos_d (d)
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
    for pos in inp_d["positions"].keys():
        pos_d = inp_d["positions"][pos]
        for x in ["+", "-"]:
            if x in pos_d:
                if "barcodes" in pos_d[x]:
                    pos_d[x] = pos_d[x]["barcodes"]
                else:
                    pos_d.pop(x, None)


def GetScaffoldLengths(genome_fna_fp):
    """ This function gets the lengths of the scaffolds, returns a dict

    Args:
        genome_fna_fp: (str) Path to genome fna file (FASTA)

    Returns:
        [Scaffold_To_Length, Scf_Name_To_Sequence]
        Scaffold_To_Length: (dict) 
            scaffold_name: (str) -> length (int)
        Scf_Name_To_Sequence: (d)
            scaffold_name: (str) -> sequence (str)
    """

    Scaffold_To_Length = {}
    Scf_Name_To_Sequence = {}

    FNA_FH = open(genome_fna_fp)

    c_line = FNA_FH.readline().strip()
    c_scaffold_name = ""
    while c_line != "":
        if c_line[0] == ">":
            if c_scaffold_name != "":
                Scaffold_To_Length[c_scaffold_name] = cs_len
                Scf_Name_To_Sequence[c_scaffold_name] = crnt_scf_seq
            c_scaffold_name = c_line[1:]
            # Current scaffold length is reset
            cs_len = 0
            # Current scaffold sequence is reset
            crnt_scf_seq = ""
        else:
            cs_len += len(c_line)
            crnt_scf_seq += c_line

        c_line = FNA_FH.readline().strip()

    FNA_FH.close()

    if c_scaffold_name != "":
        Scaffold_To_Length[c_scaffold_name] = cs_len
        Scf_Name_To_Sequence[c_scaffold_name] = crnt_scf_seq

    if len(Scaffold_To_Length.keys()) == 0:
        logging.warning("No Scaffolds found in " + genome_fna_fp)

    return [Scaffold_To_Length, Scf_Name_To_Sequence]



def GenesTableToLocsDict(gt_fp, scf_len_d):
    """
        Args:
            gt_fp: (str) Path to gene table file (TSV)
                locusId (str):sysName (str):type (int):scaffoldId (str) (e.g. scaffold5/5):begin (int):end (int):
                    strand (str +/-):name (str):desc (str):[GC (float [0,1]):nTA (int)] (Last two are optional)
                NOTE: ALL ENTRIES IN GENE TABLE MUST BE GENES, SCAFFOLD IDS MUST MATCH FNA FILE
            scf_len_d: (d)
                scaffold_name (str) -> scaffold length (int) Length of scaffold (bps)

        Returns:
            list<scf_locs_d, scf_gene_id_d>
                scf_gene_id_d: (d)
                    scf_name (str) -> genes_desc_d (d)
                        genes_desc_d: (d)
                            gene_id (str) -> [desc_d (d) , layer(int)]
                                desc_d:
                                    s:int
                                    e:int
                                    desc: description (str)
                scf_locs_d: (d)
                    scf_name (str) -> loc_list
                        loc_list (list):
                            [[begin (int), end (int), gene_id (str), strand (str "+"/"-")], ... ]
                
    """
    gt_FH = open(gt_fp, "r")
    header_line_s = gt_FH.readline()
    CheckGenesTableHeader(header_line_s)

    scf_locs_d = {}
    scf_gene_id_d = {}

    c_line = gt_FH.readline().strip()
    while c_line != "":
        fields_l = c_line.split("\t")
        scf_name, begin, end, strand, desc = fields_l[3], int(fields_l[4]), \
                                            int(fields_l[5]), fields_l[6], fields_l[8]
        gene_id = AddGeneToScfGeneID_d(scf_len_d, scf_gene_id_d, scf_name, begin, end, desc)
        AddGeneLocToScaffoldDict(scf_len_d, scf_locs_d, scf_name, begin, end, strand, gene_id)
        c_line = gt_FH.readline().strip()

    gt_FH.close()

    # Currently, scf_gene_id_d only has the description, not the layer
    # Now we get the gene's layers and add those to the mapping
    for scf_name in scf_locs_d.keys():
        scf_genes_to_layers_d = Scaffold_genes_to_layers(scf_locs_d[scf_name])
        for gene_id in scf_gene_id_d[scf_name].keys():
            # We add the layer to the list
            scf_gene_id_d[scf_name][gene_id].append(scf_genes_to_layers_d[gene_id])

    return [scf_locs_d, scf_gene_id_d]

def CheckGenesTableHeader(h_str):
    # h_str is a string from the genes table file
    stripped_s = h_str.rstrip()
    split_l = stripped_s.split("\t")
    """
    if len(split_l) != 11:
        raise Exception("Gene Table header should have length 11, instead {}.\n Line: {}".format(
            len(split_l), stripped_s))
    """
    if not (split_l[0].rstrip() == "locusId"):
        raise Exception("Gene Table header has incorrect starting value.\n Line: {}".format(
            stripped_s))




def AddGeneToScfGeneID_d(scf_len_d, scf_gene_id_d, scf_name, begin, end, desc):
    '''
    Args: 
        scf_len_d: (d)
            scaffold_name (str) -> scaffold length (int) Length of scaffold (bps)
        scf_gene_id_d: (d)
            scaffold_name -> genes_desc_d (d)
                genes_desc_d: (d)
                    gene_id (str) -> list<desc_d>
                        desc_d: (d)
                            "s": start bp (int)
                            "e": end bp (int)
                            "desc": description (str)
        scf_name, desc: (str)
        begin, end: (int)
    '''
    
    # We check if scaffold name is in genome.fna file
    if not scf_name in scf_len_d:
        raise Exception("Scaffold name {} not found in genome fna file.".format(
            scf_name))

    if scf_name in scf_gene_id_d:
        gene_id = GetGeneID(scf_gene_id_d, scf_name) 
        scf_gene_id_d[scf_name][gene_id] = [{"s": begin, "e": end, "desc": desc}]
    else:
        gene_id = scf_name + "|g_1"
        scf_gene_id_d[scf_name] = {
                gene_id: [{"s": begin, "e": end, "desc": desc}]
        }

    return gene_id




def AddGeneLocToScaffoldDict(scf_len_d, scf_locs_d, scf_name, begin, end, strand, gene_id):
    """
    scf_len_d: (d)
        scaffold_name (str) -> scaffold_length (int)
    scf_locs_d: (d)
        scf_name (str) -> loc_list
            loc_list (list):
                [[begin (int), end (int), gene_id (str), strand (str "+"/"-")], ... ]
    scf_name: (str)
    begin: (int)
    end: (int)
    strand: (str)
    gene_id: (str)


    Q: Do genes ever go over scaffolds? I.e. in between?
    """

    # We get the scaffold length from the scaffold length dict
    if not scf_name in scf_len_d:
        raise Exception(
            "Scaffold Name {} from gene table not found in genome fna file".format(
            scf_name))

    #start_frac, end_frac = begin/scf_length, end/scf_length
    
    locs_list = [begin, end, gene_id, strand] 

    if scf_name in scf_locs_d:
        scf_locs_d[scf_name].append(locs_list)
    else:
        scf_locs_d[scf_name] = [locs_list] 


    

def GetGeneID(scf_gene_d, scf_name):
    """
    Args:
        scf_gene_d: Any dict that is keeping track of genes
            added to it.
    """
    return scf_name + "|g_" + \
            str(len(scf_gene_d[scf_name].keys()) + 1)






def GetTicksFromStartandEnd(start_val, end_val, ticks_dict, 
                            position_to_count_d, first_bool,
                            scaf_range_threshold):
    """
    A recursive function that makes a dictionary of each range and counts
        the number of insertions in between values. 
    
    Args:
        start_val: (int)
        end_val: (int)
        ticks_dict: (dict)
            tick_name: (str) -> tick_range_info_d (d)
                tick_range_info_d: (d)
                    min_x: start_val,
                    max_x: end_val,
                    max_y: max(insertion_values),
                    bar_data: list<sublist>
                        sublist: [strt, end, num_insert]
        position_to_count_d: (A dict which contains values:
            position (str) -> count of insertions at point, need not contain all
                ints from 1 to the end as keys
                
        first_bool: (bool) DEPRECATED
            If it's the first time, the tick name is "start_data" (DEPRECATED)

        scaf_range_threshold: (int)
            A number which serves as a threshold for whether
                a certain tick_range is inputted to the ticks_dict.
                e.g. If it's 1000, then all ranges less than
                and equal to size 1000 are left out of final dict
    Returns: (Updates)
        ticks_dict: (d)
            min_x: (min position on scaffold)
            max_x: (max position on scaffold)
            max_y: (max number of insertions)
            bar_data: list<list>
                list of lists, each sublist has:
                    [start_val, end_val, num_insertions]
    
    """

    tick_name = str(start_val) + "-" + str(end_val)

    """
    if first_bool:
        tick_name = "start_data"
    """

    if not (isinstance(start_val, int) and isinstance(end_val, int)):
        raise Exception("Start and End Values must be integers")
    if not end_val >= start_val:
        raise Exception("End value must be greater or equal to start value.")
    if end_val - start_val == 1:
        if str(end_val) in position_to_count_d:
            return position_to_count_d[str(end_val)]
        else:
            return 0
    elif end_val - start_val <=10:
        ticks_list = [[i, i + 1] for i in range(start_val, end_val)]
    else:
        subdivs = ConvertValueIntoSubDivs(end_val - start_val)
        ticks_list = GetTickValues(start_val, end_val, subdivs)


    insertion_values = []
    for tick_vals in ticks_list:
        # Each tick_val is [start_val, end_val]
        insertion_values.append(GetTicksFromStartandEnd(tick_vals[0], 
                                                    tick_vals[1], 
                                                    ticks_dict,
                                                    position_to_count_d,
                                                    False,
                                                    scaf_range_threshold))

    bar_data = []
    for i in range(len(ticks_list)):
        # Position in scaffold L, R, number of insertions
        bar_data.append([ticks_list[i][0], insertion_values[i]])

    value_sum = sum(insertion_values)

    if end_val - start_val > scaf_range_threshold:
        ticks_dict[tick_name] = bar_data 


    return value_sum 


def ConvertValueIntoSubDivs(Val):
    """
    Important Questions:
    1. Max ticks in bar chart assuming no more than 3 digits per value?
        Answer: 20
    2. Min ticks in bar chart?
        Answer: 8
    3. How to note power of ten in data?

    4. We include upper bound, but not lower bound in data.
    e.g. in [0,30] we include values 1,30 inclusive.

    Meaning: 
        if N = d * 10^n, d > 5 implies division is 5 * 10^(n-2)
        4 < d < 5 implies division is  2.5 * 10^(n-2)
        2 < d < 4 implies division is  2 * 10^(n-2)
        1 < d < 2 implies division is 1 * 10^(n-2)
    """

    dig, power = BaseNotation(Val, 10, 20)

    if power == 0:
        subdivs = 1 
    else:
        if dig >=4: 
            subdivs = 5 * (10**(power-1))
        elif dig >=2: 
            subdivs = 2 * (10**(power-1))
        elif dig >=1: 
            subdivs = 1 * (10**(power-1))
        else:
            raise Exception("dig less than 1 ??")

    return subdivs




def GetTickValues(start_val, end_val, subdivs):
    """We go from a value and subdivs to actual graph ticks

    Args:
        start_val: (int)
        end_val: (int)
        subdivs: (int)

    Returns:
        ticks_list = [[start_val, start_val + subdivs], [start_val + subdivs,...]

    Specifically, this function starts from start_val and adds subdiv until reaching
        end_val. Note that difference between start_val and end_val does not 
        need t
    """
    # First we get a list of just each tick, not the start and end ticks (no dbl)
    init_tick_list = [start_val]

    crnt_val = start_val + subdivs

    while crnt_val < end_val:
        init_tick_list.append(crnt_val)
        crnt_val = crnt_val + subdivs

    init_tick_list.append(end_val)

    # Now we make list with starts and ends
    ticks_list = []
    # Note init_tick_list has at least 2 values
    for i in range(len(init_tick_list) - 1):
        ticks_list.append([init_tick_list[i], init_tick_list[i+1]])

    return ticks_list 






def BaseNotation(N, base, max_power):
    """ We get power of base and digit multiplier.
        Eg. if N = 346, base = 10 we return [3.46, 2] because
            3.46 * 10^2 = 346 


    Args:
        N: int, number to find bounds for. MUST BE > 0
        base: int 
        max_power: int (limit so function doesn't run forever with while loop)

    Returns:
        [a, b (power of 10)] where a*10^b = N

    """
    if N <= 0:
        raise Exception("Bounds for a number must have number > 0")
    if not isinstance(N, int):
        raise Exception("N input must be an int. Insteadn: " + str(type(N)))

    for i in range(max_power):
        if N >= base**i and N < base**(i+1):
            return [ float(N)/float(base**i), i]

    excp_str = "Number {} not found between powers 0 to {} with base {}".format(
            N, max_power, base)
    raise Exception(excp_str)



def Scaffold_genes_to_layers(scf_genes_list):
    """
    This function is #1 involved in getting the layer of the gene for the visualization.
    scf_genes_list: (list)
        list<[begin, end, gene_id, strand]>

    Returns:
        genes_to_layers (d):
            gene_id (str) -> layer (int)
    """
    genes_to_layers = {}

    for i in range(len(scf_genes_list)):
        gene_l = scf_genes_list[i]
        occupied_layers = {}

        k = i - 1
        SeparatedGeneFound = False
        while k > 0 and not SeparatedGeneFound:
            if gene_l[0] > scf_genes_list[k][1]:
                SeparatedGeneFound = True
                AssignToLayersDicts(genes_to_layers, 
                                    occupied_layers,
                                    gene_l)
            else:
                occupied_layers[genes_to_layers[
                                scf_genes_list[k][2]]] = 1
                k = k - 1

        if not SeparatedGeneFound:
            # This means all layers are oocupied all the way to the beginning
            AssignToLayersDicts(genes_to_layers,
                                occupied_layers,
                                gene_l)

    return genes_to_layers 

            
        
def AssignToLayersDicts(genes_to_layers, occupied_layers,
                        gene_l):
    """
        This function is #2 involved in getting the layer of the gene for the visualization.
    genes_to_layers: (d)
        gene_id: -> layer number (int)
    occupied_layers: (d)
        layer_number (str) "1", .. -> 1 (int) just to keep track
    gene_l: [begin, end, gene_id, strand]
    """

    # getting lowest unoccupied layer
    if len(occupied_layers.keys()) > 0:
        max_occupied_layer = max([int(x) for x in occupied_layers.keys()])

        opening = False
        chosen_layer = None
        for d in range(1, max_occupied_layer):
            if str(d) not in occupied_layers:
                chosen_layer = d
                opening = True

        if not opening:
            chosen_layer = max_occupied_layer + 1
    else:
        chosen_layer = 1

    genes_to_layers[gene_l[2]] = chosen_layer
    

def test(args):

    min_v = args[1]
    max_v = args[2]
    op_fp = args[3]

    # Create random dict
    pos_to_num_d = {}
    for i in range(int(min_v), int(max_v) + 1):
        pos_to_num_d[str(i)] = random.randint(0,5)

    ticks_dict = {}
    GetTicksFromStartandEnd(int(min_v), int(max_v), ticks_dict, 
            pos_to_num_d, True)

    print("printing out initial json file")
    with open("temporary_json.jsonold", "w") as f:
        f.write(json.dumps(ticks_dict, indent=4))

    init_json_FH = open("temporary_json.jsonold", "r")
    final_FH = open(op_fp, "w")

    first_line = init_json_FH.readline()
    first_line = "Chart_Data = " + first_line
    final_FH.write(first_line)

    print("printing out final js file")
    c_line = init_json_FH.readline()
    while c_line != "":
        final_FH.write(c_line)
        c_line = init_json_FH.readline()
        
    init_json_FH.close()
    final_FH.close()
    os.unlink("temporary_json.jsonold")

    print("Wrote js file to " + op_fp)
    
    return None


def main():

    args = sys.argv

    if args[-1] == "1":
        test(args)
    elif args[-1] == "2":
        ScfPosBC_Info_To_Scaffolds(args[1], int(args[2]), args[3], args[4], args[5])
    else:
        ret = "How to use:\n"
        ret += "python3 ScfPosBC_To_BarChartData.py ScfPosBC.json scf_range (int) gene_table_fp genome_fna op_dir 2\n"
        ret += "Above writes display data file of insertions for each scaffold to op_dir/scf_name_EBC_data.js\n"
        #ret += "And it writes each scaffold separately to the op_dir/scf_name_bc_data.js\n"
        print(ret)

    return None

if __name__ == "__main__":
    main()




#def Scaffold_to_Data_Viz_d(scaffold_inp_d):
"""We convert Scaffold dict to data viz dict

    Args:
        scaffold_inp_d:
            scaffold_name: (str)
            scaffold_length: (int)
            positions: (d)
                position str<int> -> pos_d (d)
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
    Returns:
        pos_to_count_and_gene_info_d: (known as data_viz_d by Javascript)
            scaffold_name: (str)
            scaffold_length: (int)
            pos_to_count: (d)
                pos (str) -> number of insertions (int) 
            pos_to_info_d: (d)
                pos (str) -> info_d 
                    info_d:
                        strand: list<strand_str>
                            strand_str: (str) "+"/"-"
                        barcodes: list<barcode_str>
                            barcode_str: (string) Barcode (20 bp)
                        genes: (d)
                            gene_id -> <gene_d>
                                gene_d: (d)
                                    gene_pos_in_scaffold": "195744:196064",
                                    bc_pos_within_gene": 253,
                                    gene_length": 320,
                                    bc_loc_percent_within_gene": 0.790625,
                                    gene_desc": "Copper tolerance protein",
"""
"""
    raise Exception("Currently Broken - Move to separating out individual scaffolds?")
    pos_to_count = {}
    pos_to_info_d = {}
    for bc in scaffold_inp_d["barcodes"].keys():
        bc_related_d = scaffold_inp_d["barcodes"][bc]
        pos = str(bc_related_d["scaffold_loc"]["position"])
        if pos in pos_to_count:
            pos_to_count[pos] += 1
        else:
            pos_to_count[pos] = 1

        strand_str = bc_related_d["scaffold_loc"]["strand"]
        if pos in pos_to_info_d:
            info_d = pos_to_info_d[pos]
            if strand_str not in info_d["strand"]:
                info_d["strand"].append(strand_str)
            info_d["barcodes"].append(bc)

            if "genes_insertion_list" in bc_related_d:
                for g_d in bc_related_d["genes_insertion_list"]:
                    if g_d["gene_id"] not in info_d["genes"]:
                        info_d["genes"][g_d["gene_id"]] = g_d 
        else:
            info_d = {
                    "strand": [strand_str],
                    "barcodes": [bc],
                    "genes": {}
                    }
            if "genes_insertion_list" in bc_related_d:
                for g_d in bc_related_d["genes_insertion_list"]:
                    if g_d["gene_id"] not in info_d["genes"]:
                        info_d["genes"][g_d["gene_id"]] = g_d 
        
        pos_to_info_d[pos] = info_d


    pos_to_count_and_gene_info_d = {
            "scaffold_name": scaffold_inp_d["scaffold_name"],
            "scaffold_length": scaffold_inp_d["scaffold_length"],
            "pos_to_count": pos_to_count,
            "pos_to_info_d": pos_to_info_d
    }


    return pos_to_count_and_gene_info_d
"""
