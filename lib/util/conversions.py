#python


"""
This file is used to convert genbank files into other formats.
For example, converting a genbank file into a gene table.
"""
import os
import sys
import logging



"""
Inputs: custom_model_string (str) String of custom model. 
    Should look like the other models (2 lines, etc)
Outputs: tested_model_string (str) String of custom model.
"""
def check_custom_model(custom_model_string):

    if len(custom_model_string) < 2:
        raise Exception("Custom Model form incorrect, it contains fewer than 2 "
        "characters while it should be at least 20 bp long.")
        
    if len(custom_model_string.split("\n")) > 3:
        raise Exception("Custom Model form incorrect- max amount of lines is 2.")
    
    #For now there is minimal testing. Eventually add specific tests.
    tested_model_string = custom_model_string

    return tested_model_string
    


"""
Info:
    Test Mode takes only the first 100 lines of the file and runs it 
    against a model.

Inputs: fastq_fp: (str) Fastq filepath

"""
def run_test_mode(fastq_fp):
    #First we try to take the first 1000 lines of the file
    try:
        with open(fastq_fp) as myfile:
            first_lines = [next(myfile) for x in range(1000)]
    except:
        #There are fewer than a thousand lines in the file.
        pass
    new_file_str = "\n".join(first_lines)
    logging.critical("TEST MODE FILE:")
    for i in range(100):
        logging.critical(first_lines[i])
    logging.critical(new_file_str[:1000])
    x = open(fastq_fp, "w")
    x.write(new_file_str)
    x.close()




def main():
    args = sys.argv
    gbk_fp = args[1]
    out_fp = args[2]
    logging.basicConfig(level = logging.DEBUG)
    config_dict = {}
    convert_genbank_to_genome_table(gbk_fp, out_fp, config_dict)


if __name__=="__main__":
    main()
