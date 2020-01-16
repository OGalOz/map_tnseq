#python


"""
This file is used to convert genbank files into other formats.
For example, converting a genbank file into a genome table.
"""
import os
import sys
from Bio import SeqIO
import logging

"""
Inputs: 
    genbank_filepath: (str) Path to genbank file.
    output_filepath: (str) Path to write genome table to


The genes table must include the fields
   scaffoldId, begin, end, strand, desc
and it should either include only protein-coding genes or it should
include the field 'type' with type=1 for protein-coding genes.
config_dict:
    scaffold_name: (str) The scaffold id in the genbank file
    description_name: (str) The description id in the genbank file

"""
def convert_genbank_to_genome_table(genbank_filepath, output_filepath, config_dict):

    output_file_start_line = "scaffoldId\tbegin\tend\tstrand\tdesc\tLocusId\ttype\n"
    output_file_string = output_file_start_line
    gb_record = SeqIO.read(open(genbank_filepath, "r"), "genbank")
    genome_name = gb_record.name
    #Genome sequence:
    g_seq = gb_record.seq
    g_len = len(g_seq)
    #Genome features (list of features):
    g_features = gb_record.features
    g_feat_len = len(g_features)

    #Testing:
    """
    for i in range(10):
        logging.info(g_features[i])

    raise Exception()
    """
    scaffoldId_exists= False
    if "scaffold_name" in config_dict:
        scaffold_id = config_dict["scaffold_name"]
        scaffoldId_exists = True
    try:
        i = 0
        while i < g_feat_len:
            current_feat = g_features[i]
            #logging.info(current_feat)
            #raise Exception()
            current_row = ""
            if scaffoldId_exists:
                scaffold = g_features[i].qualifiers[scaffold_id]
            else:
                scaffold = "1"
            current_row += scaffold + "\t"
            current_row += str(current_feat.location.start) + "\t"
            current_row += str(current_feat.location.end) + "\t"
            if current_feat.strand == 1:
                strand = "+"
            elif current_feat.strand == -1:
                strand = "-"
            else:
                logging.critical("Could not recognize strand type.")
                raise Exception("Parsing strand failed.")
            current_row += strand + "\t"

            #DESCRIPTION
            if "product" in current_feat.qualifiers.keys():
                current_row += str(current_feat.qualifiers['product'][0]) + "\t"
            else:
                current_row += "Unknown_Description." + "\t"
                logging.critical("Could not find protein in current_feat")

            #Locus ID:
            if "locus_tag" in current_feat.qualifiers.keys():
                current_row += str(current_feat.qualifiers['locus_tag'][0]) + "\t"
            else:
                current_row += "Unknown_Locus_tag." + "\t"
                logging.critical("Could not find locus tag in current _feat")

            #Protein ID
            if current_feat.type.strip() == "CDS":
                typ = "1" 
            else:
                #This may need to be changed to give more specificity later on.
                typ = "10"
            current_row += typ + "\n"
                    
            output_file_string += current_row
            i = i + 1


    except:
        logging.critical("Could not parse all features in genbank file.")
        raise Exception("Parsing genbank file into genome table failed")

    #We remove duplicate gene lines and remove the last new line symbol
    output_file_string = unduplicate_gene_table(output_file_string[:-2])
    output_file_string = type_1_gene_table(output_file_string)
    output_file_string = output_file_start_line + output_file_string
    f = open(output_filepath ,"w")
    f.write(output_file_string)
    f.close()

    return 0


"""
This function removes duplicates from the gene table
Inputs:
    gene_table_string: (str) A string of the entire gene table file
Outputs:
    gene_table_string: (str) A string of the entire gene table file
"""
def unduplicate_gene_table(gene_table_string):

    #first we split the gene_table into lines:
    gt_lines = gene_table_string.split("\n")[1:]
    logging.info("total lines: " + str(len(gt_lines)))

    #Then for each line we check if it's a duplicate or not.
    #We add the indices of duplicate lines and then remove the lines in reverse order.
    existing_indices = gt_lines[0].split("\t")[1:3]
    previous_index = 0
    duplicate_line_indices = []
    for i in range(1, len(gt_lines)):
        current_indices = gt_lines[i].split("\t")[1:3]
        if current_indices[0] == existing_indices[0] or current_indices[1] == existing_indices[1]:
            duplicate_line_indices.append(previous_index)
            previous_index = i
        else:
            existing_indices = current_indices
            previous_index = i
    logging.info("Duplicate Lines: " + str(len(duplicate_line_indices)))

    #removing the indeces in reverse order:
    for i in reversed(range(len(duplicate_line_indices))):
        del gt_lines[duplicate_line_indices[i]]

    logging.info("New total line number: (after duplicate line removal)" + str(len(gt_lines)))



    #Converting list into string again:
    gene_table_string = "\n".join(gt_lines)


    return gene_table_string


"""
Inputs:
    gene_table_string: (str) The gene table string
Outputs: 
    gene_table_string: (str) The gene table string.
"""
def type_1_gene_table(gene_table_string):
    gt_lines = gene_table_string.split("\n")[1:]
    non_type_1_indices = []

    #For each line, we check if its type is 1. If not, we remove it later.
    for i in range(1, len(gt_lines)):
        current_type = gt_lines[i].split("\t")[6]
        if current_type != "1":
            non_type_1_indices.append(i)


    #removing the indeces in reverse order:
    for i in reversed(range(len(non_type_1_indices))):
        del gt_lines[non_type_1_indices[i]]

    logging.info("New total line number (after type 1): " + str(len(gt_lines)))

    #Converting list into string again:
    gene_table_string = "\n".join(gt_lines)

    return gene_table_string


    return 0



def main():
    args = sys.argv
    gbk_fp = args[1]
    out_fp = args[2]
    logging.basicConfig(level = logging.DEBUG)
    config_dict = {}
    convert_genbank_to_genome_table(gbk_fp, out_fp, config_dict)


if __name__=="__main__":
    main()
