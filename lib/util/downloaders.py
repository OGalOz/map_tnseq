#python3
import os
import logging
import sys
from Bio import SeqIO

# We download Genome Files: gfu is Genome File Util
def DownloadGenomeToFNA(gfu, genome_ref, scratch_dir):
    """
    Inputs: GFU Object, str (A/B/C), str path
    Outputs: [fna_fp (str), gbk_fp (str)]
    """

    GenomeToGenbankResult = gfu.genome_to_genbank({'genome_ref': genome_ref})
    genbank_fp = GenomeToGenbankResult['genbank_file']['file_path']

    genome_fna_fp = get_fa_from_scratch(scratch_dir)

    if genome_fna_fp is None:
        raise Exception("GFU Genome To Genbank did not download Assembly file in expected Manner.")

    """
    genome_fna_filename = "genome_fna"
    genome_fna_fp = os.path.join(scratch_dir, genome_fna_filename)

    #The following creates a file at genome_fna_fp
    SeqIO.convert(genbank_fp, "genbank", genome_fna_fp, "fasta")

    #Following gets important info from genbank file
    gt_config_dict = get_gene_table_config_dict(genbank_fp)
    """

    return [genome_fna_fp, genbank_fp]


def get_fa_from_scratch(scratch_dir):
    """
    Careful... May not work in the Future
    Inputs:
        scratch_dir: (str) Path to work dir/ tmp etc..
    Outputs:
        FNA fp: (str) Automatic download through GenbankToGenome
    """
    
    fna_fp = None
    scratch_files = os.listdir(scratch_dir)
    for f in scratch_files:
        if f[-2:] == "fa":
            fna_fp = os.path.join(scratch_dir, f)
            break

    return fna_fp




def download_fastq(dfu, fastq_refs_list, scratch_dir, output_fp):
    # We get multiple shock objects at once.
    get_shock_id_params = {"object_refs": fastq_refs_list, 
            "ignore_errors": False}
    get_objects_results = dfu.get_objects(get_shock_id_params)
    logging.debug(get_objects_results['data'][0])
    logging.debug(len(get_objects_results['data']))
    
    # We want to associate a ref with a filename and get a dict that has this
    # association

    raise Exception("STOP - INCOMPLETE")
    fq_shock_id = get_objects_results['data'][0]['data']['lib']['file']['id']
    fastq_download_params = {'shock_id': fq_shock_id,'file_path': fastq_fp, 'unpack':'unpack'}
    #Here we download the fastq file itself:
    logging.info("DOWNLOADING FASTQ FILE " + str(i))
    file_info = dfu.shock_to_file(fastq_download_params)
    logging.info(file_info)



def DownloadFASTQs(dfu, fastq_ref_list, output_dir):
    """
    dfu: DataFileUtil Object
    fastq_ref_list: (list<s>) list of refs 'A/B/C' A,B,C are integers
    output_dir: (s) Path to scratch directory or tmp_dir
    """
    fastq_fp_l = []


    for i in range(len(fastq_ref_list)):
        crnt_fastq_ref = fastq_ref_list[i]
        logging.critical("crnt fq ref: " + crnt_fastq_ref)
        #Naming and downloading fastq/a file using DataFileUtil
        fastq_fn = "FQ_" + str(i)
        fastq_fp = os.path.join(output_dir, fastq_fn)
        get_shock_id_params = {"object_refs": [crnt_fastq_ref], "ignore_errors": False}
        get_objects_results = dfu.get_objects(get_shock_id_params)

        # We should try to get file name from Get Objects Results
        fq_shock_id = get_objects_results['data'][0]['data']['lib']['file']['id']
        fastq_download_params = {'shock_id': fq_shock_id,'file_path': fastq_fp, 'unpack':'unpack'}
        #Here we download the fastq file itself:
        logging.info("DOWNLOADING FASTQ FILE NUMBER " + str(i+1))
        file_info = dfu.shock_to_file(fastq_download_params)
        logging.info(file_info)
        fastq_fp_l.append(fastq_fp)

    return fastq_fp_l










# We want scaff ld_name and description_name
def get_gene_table_config_dict(genbank_fp):
    record = SeqIO.read(genbank_fp, "genbank") 
    print(record.description)
    print(record.id)
    
    gene_table_config_dict = {
            "keep_types": ["1"],
            "scaffold_name": record.id,
            "description": record.description}

    return gene_table_config_dict

def test():
    get_gene_table_config_dict(
            '/Users/omreeg/tmp/Test_Files/E_Coli_BW25113.gbk')


