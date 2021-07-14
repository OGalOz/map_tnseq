#!python3


import os
import sys
import logging
import json
import shutil
from util.validate import validate_init_params
from util.downloaders import DownloadGenomeToFNA , DownloadFASTQs, GetGenomeOrganismName, \
                             download_genes_table, download_model
from util.genbank_to_gene_table import  genbank_and_genome_fna_to_gene_table, OLD_convert_genbank_to_gene_table
from util.upload_pool import upload_poolfile_to_KBase



"""
This function needs to do a number of things:
    1. Validate Parameters and make sure they're all of the right type, etc.
    2. Download genbank file and fastq file(s).
    3. Create gene table file
    4. Create config files for the function "RunFullProgram" 
"""
def PrepareProgramInputs(params, cfg_d):
    """
    params: (d) As imported by spec file
    cfg_d: (d)
        gfu: GenomeFileUtil object
        tmp_dir: (s) path to tmp dir
        dfu: DataFileUtil object
        model_dir: (s) Path to model's directory: (Should always be scratch_dir)
        gene_table_fp: (s) Path to gene table
        blat_cmd: (s) Path to blat loc
        unmapped_fp: (s) Path to unmapped_fp (write)
        tmpFNA_fp: (s) Path to tmp fna (write)
        trunc_fp: (s) Path to Trunc (write)
        endFNA_fp: (s) Path to endFNA (write)
        R_fp: (s) Path to PoolStats.R file
        R_op_fp: (s) Path to write R
        MTS_cfg_fp: (s) Path to write MapTnSeq Config
        DRP_cfg_fp: (s) Path to write Design Random Pool Config
        gffToGeneTable_perl_fp: (s) Path to perl script
        ws: Workspace Object

    Adds the following keys:
        genome_fna_fp: (File path to the Genome FNA file)
    """

    # validated params
    vp = validate_init_params(params, cfg_d)


    # Download genome in GBK format and convert it to fna:
    # gt stands for genome table
    genome_fna_fp = DownloadGenomeToFNA(cfg_d['gfu'], vp['genome_ref'], cfg_d['tmp_dir'])
    cfg_d['genome_fna_fp'] = genome_fna_fp
    genome_scientific_name = GetGenomeOrganismName(cfg_d['ws'], vp['genome_ref'])

    # Downloading genes table
    download_genes_table(vp['gene_table_ref'], cfg_d['dfu'], cfg_d['gene_table_fp'])

    # Downloading Model
    model_fp = download_model(vp['model_ref'], cfg_d['dfu'], cfg_d['model_dir'])

    cfg_d["model_fp"] = model_fp

    # FASTQs output dir
    fq_dir = os.path.join(cfg_d['tmp_dir'], "FASTQs")
    fastq_fp_l = DownloadFASTQs(cfg_d['dfu'], vp['fastq_ref_list'], fq_dir )

    cfg_d['fastq_fp_l'] = fastq_fp_l

    # This function creates the gene_table at the location gene_table_fp
    # genbank_and_genome_fna_to_gene_table(gbk_fp, genome_fna_fp, cfg_d['gene_table_fp'])

    MTS_cfg_d, DRP_cfg_d = Create_MTS_DRP_config(cfg_d, vp)

    # Here we write the MapTNSeq config dict 
    # and DRP config dict out to file
    with open(cfg_d["MTS_cfg_fp"], "w") as f:
        f.write(json.dumps(MTS_cfg_d, indent=4))

    with open(cfg_d["DRP_cfg_fp"], "w") as f:
        f.write(json.dumps(DRP_cfg_d, indent=4))

    logging.info("Wrote both config files. MTS at {}, DRP at {}".format(
                cfg_d["MTS_cfg_fp"], cfg_d["DRP_cfg_fp"]))

    MTS_cfg_d, DRP_cfg_d = None, None

    pool_op_fp = os.path.join( cfg_d["tmp_dir"] ,vp["output_name"] + ".pool")

    return [pool_op_fp, vp, genome_scientific_name]


def PrepareUserOutputs(vp, cfg_d):
    """
    cfg_d:
        username: s,
        ws_id:
        ws_obj:
        workspace_name: s,
        pool_fp: s,
        dfu:
        css_style_fp: s
        Main_HTML_report_fp: s
        model_test: b
        gene_table_fp: s

    vp:
        genome_ref: s,
        fastq_ref_list: list<s>,
        pool_description: s,
        KB_Pool_Bool: b,
       
    Description:
        Upload PoolFile to make KBaseRBTnSeq.RBTS_PoolFile object.
    """

    """
    USED TO DO THIS
    # Here we upload the pool file to KBase to make a PoolFile Object
    if vp['KB_Pool_Bool']:

        logging.info("UPLOADING POOL FILE to KBASE through DataFileUtil")
        upload_params = {
                'username': cfg_d['username'],
                'genome_ref': vp['genome_ref'],
                'gene_table_ref': vp['gene_table_ref'],
                'model_ref': vp['model_ref'],
                'fastq_refs': vp['fastq_ref_list'],
                'pool_description': vp['pool_description'] ,
                'workspace_id': cfg_d['ws_id'],
                'ws_obj': cfg_d['ws'],
                'poolfile_fp': cfg_d['pool_fp'],
                'poolfile_name': vp['output_name'] + ".pool",
                'dfu': cfg_d['dfu']
                }
        upload_poolfile_results = upload_poolfile_to_KBase(upload_params)
        logging.info("Upload Pool File Results:")
        logging.info(upload_poolfile_results)
    """
   

    # We make a directory containing the resultant files
    res_dir = os.path.join(cfg_d['tmp_dir'], "results")
    os.mkdir(res_dir)
    #shutil.copy(cfg_d["Main_HTML_report_fp"], res_dir)

    if "model_test" not in cfg_d:
        shutil.copy(cfg_d['pool_fp'], res_dir)
        shutil.copy(cfg_d["gene_table_fp"], res_dir)
    else:
        if not cfg_d["model_test"]: 
            # Here we decide which files besides HTML to return to User and place in a directory
            # Pool File, ".surprise?", "html?"
            shutil.copy(cfg_d['pool_fp'], res_dir)
            shutil.copy(cfg_d["gene_table_fp"], res_dir)




    # Returning file in zipped format:-------------------------------
    file_zip_shock_id = cfg_d['dfu'].file_to_shock({'file_path': res_dir,
                                          'pack': 'zip'})['shock_id']

    dir_link = {
            'shock_id': file_zip_shock_id, 
           'name':  'results.zip', 
           'label':'map_tnseq_output_dir', 
           'description': 'The directory of outputs from running' \
            + ' Map TnSeq and Design Random Pool'
           }
    
    # Preparing HTML output
    html_dir = os.path.join(cfg_d["tmp_dir"], "HTML")
    #os.mkdir(html_dir)
    #shutil.move(cfg_d['css_style_fp'], html_dir)
    #shutil.move(cfg_d['Main_HTML_report_fp'], html_dir)

    HTML_report_shock_id = cfg_d['dfu'].file_to_shock({
            "file_path": html_dir,
            "pack": "zip"
            })['shock_id']

    HTML_report_d_l = [{"shock_id": HTML_report_shock_id,
                        "name": os.path.basename(os.path.join(html_dir,"FullDisplay_index.html")),
                        "label": "MutantReport",
                        "description": "HTML Summary Report for MapTnSeq and Design Random Pool app"
                        }]


    report_params = {
            'workspace_name' : cfg_d['workspace_name'],
            "html_links": HTML_report_d_l,
            "direct_html_link_index": 0,
            "html_window_height": 333,
            "report_object_name": "KB_MTS_DRP_Report",
            "message": ""
            }

    report_params["file_links"] = [dir_link]


    return report_params



def Create_MTS_DRP_config(cfg_d, vp):
    """
    Inputs:
        cfg_d: (as above in PrepareProgramInputs)
            Plus:
            fastq_fp_l: (list<s>) List of file paths
            genome_fna_fp: (File path to the Genome FNA file)

        vp: (d) must contain all used cases below
    Outputs:
        [MTS_cfg, DRP_cfg]
    """
    # Here we create the config dicts
    map_tnseq_config_dict = {

        "values": {
            "debug": False,
            "keepblat8": True,
            "keepTMPfna": True,
            "flanking": 5,
            "wobbleAllowed": 2,
            "tmp_dir": cfg_d["tmp_dir"],
            "tileSize": 11,
            "stepSize": 11,
            "blatcmd": cfg_d["blat_cmd"],
            "unmapped_fp": cfg_d["unmapped_fp"],
            "tmpFNA_fp": cfg_d["tmpFNA_fp"],
            "trunc_fp": cfg_d["trunc_fp"],
            "endFNA_fp": cfg_d["endFNA_fp"],
            "model_fp": cfg_d["model_fp"],
            "maxReads": vp["maxReads"],
            "minQuality": vp["minQuality"],
            "minIdentity": vp["minIdentity"],
            "minScore": vp["minScore"],
            "delta": vp["delta"],
            "fastq_fp_list":  cfg_d['fastq_fp_l'],
            "genome_fp": cfg_d['genome_fna_fp']
        }
    }


    design_random_pool_config_dict = {
            "values": {
                "minN": vp["minN"],
                "minFrac": vp["minFrac"],
                "minRatio": vp["minRatio"],
                "maxQBeg": vp["maxQBeg"],
                "tmp_dir": cfg_d["tmp_dir"],
                "R_fp": cfg_d["R_fp"],
                "R_op_fp": cfg_d["R_op_fp"],
                "genes_table_fp": cfg_d["gene_table_fp"]
                }
            }

    return [map_tnseq_config_dict, design_random_pool_config_dict]


def test():

    return None

def main():

    test()
    return None

if __name__ == "__main__":
    main()
