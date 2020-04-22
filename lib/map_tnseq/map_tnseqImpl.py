# -*- coding: utf-8 -*-
#BEGIN_HEADER
import logging
import os
import subprocess
import shutil

from installed_clients.KBaseReportClient import KBaseReport
from installed_clients.GenomeFileUtilClient import GenomeFileUtil
from installed_clients.AssemblyUtilClient import AssemblyUtil
from installed_clients.DataFileUtilClient import DataFileUtil
from installed_clients.WorkspaceClient import Workspace
from Bio import SeqIO
from util.genbank_to_gene_table import convert_genbank_to_gene_table
from util.conversions import check_custom_model
from util.validate import validate_init_params
from util.downloaders import download_genome_convert_to_fna
from util.upload_pool import upload_poolfile_to_KBase
#END_HEADER


"""
In this file we first download a genome fna using Genome file utils.
We also enable the user to submit an option of a model from 
existing models in 
https://bitbucket.org/berkeleylab/feba/src/master/bin/MapTnSeq.pl.
They also upload one fastq file (or many) and that's enough to run
Map TnSeq, the script only cares about a single end read.

This returns a TSV file in this format:
        The output file is tab-delimited and contains, for each usable
    read, the read name, the barcode, which scaffold the insertion
    lies in, the position of the insertion, the strand that the read
    matched, a boolean flag for if this mapping location is unique or
    not, the beginning and end of the hit to the genome in the read
    after trimming the transposon sequence, the bit score, and the
    %identity.



"""

class map_tnseq:
    '''
    Module Name:
    map_tnseq

    Module Description:
    A KBase module: map_tnseq
    '''

    ######## WARNING FOR GEVENT USERS ####### noqa
    # Since asynchronous IO can lead to methods - even the same method -
    # interrupting each other, you must be *very* careful when using global
    # state. A method could easily clobber the state set by another while
    # the latter method is running.
    ######################################### noqa
    VERSION = "0.0.1"
    GIT_URL = ""
    GIT_COMMIT_HASH = ""

    #BEGIN_CLASS_HEADER
    #END_CLASS_HEADER

    # config contains contents of config file in a hash or None if it couldn't
    # be found
    def __init__(self, config):
        #BEGIN_CONSTRUCTOR
        self.callback_url = os.environ['SDK_CALLBACK_URL']
        self.shared_folder = config['scratch']
        logging.basicConfig(format='%(created)s %(levelname)s: %(message)s',
                            level=logging.INFO)
        self.ws_url = config['workspace-url']
        #END_CONSTRUCTOR
        pass


    def run_map_tnseq(self, ctx, params):
        """
        This example function accepts any number of parameters and returns results in a KBaseReport
        :param params: instance of mapping from String to unspecified object
        :returns: instance of type "ReportResults" -> structure: parameter
           "report_name" of String, parameter "report_ref" of String
        """
        # ctx is the context object
        # return variables are: output
        #BEGIN run_map_tnseq
        report_util = KBaseReport(self.callback_url)
        logging.basicConfig(level=logging.DEBUG)
        dfu_tool = DataFileUtil(self.callback_url)
        gfu = GenomeFileUtil(self.callback_url)
        #We need the workspace object to get info on the workspace the app is running in.
        token = os.environ.get('KB_AUTH_TOKEN', None)
        ws = Workspace(self.ws_url, token=token)
        x = ws.get_workspace_info({'workspace': params['workspace_name']})
        workspace_id = x[0]




        os.chdir("/kb/module")
        cwd = "/kb/module"

        map_tnseq_dir = os.path.join(cwd, 'lib/map_tnseq/MapTnSeq_Program')
        run_dir = os.path.join(map_tnseq_dir, 'bin') 
        tmp_dir = self.shared_folder



        # CREATING DIRS
        #We make a return directory for all files:
        return_dir = os.path.join(self.shared_folder,"return_dir")
        os.mkdir(return_dir)
        #We make a directory for the Map TnSeq Files:
        map_tnseq_return_dir = os.path.join(return_dir, 'map_tnseq_return_dir')
        os.mkdir(map_tnseq_return_dir)
        #We make a directory for the gene tables:
        gene_tables_dir = os.path.join(return_dir,'gene_tables_dir')
        os.mkdir(gene_tables_dir)
        #We make a directory for the pool files:
        design_pool_dir = os.path.join(return_dir, 'design_pool_dir')
        os.mkdir(design_pool_dir)

        logging.info(params)



        # The following function validates all the input parameters
        # and returns a dict of the validated params.
        val_par = validate_init_params(params, map_tnseq_dir)

        logging.info("Validated Params:")
        logging.info(val_par)

        # We get the main output name from the validated params
        main_output_name = val_par['output_name']

        # We create a filepath for the gene table
        gene_table_fp = os.path.join(gene_tables_dir, 
                main_output_name + "_gene_table.tsv")

        #Downloading genome in genbank format and converting it to fna:
        genome_fna_fp, gt_config_dict, gbk_fp = download_genome_convert_to_fna(
                gfu, val_par['genome_ref'], self.shared_folder)


        # This function makes the gene_table at the location gene_table_fp
        convert_genbank_to_gene_table(gbk_fp, gene_table_fp,
                gt_config_dict)


        # Preparing the Model
        model_fp = os.path.join(map_tnseq_dir, 'primers/' + val_par['model_name'])
        # Check if model file exists
        logging.critical("We check if model file exists:")
        if (os.path.exists(model_fp)):
            logging.critical(model_fp + " does exist")
        else:
            logging.critical(os.listdir(os.path.join(map_tnseq_dir, "primers")))
            raise Exception("Could not find model filepath: {}".format(model_fp))


       

        #We change to the directory in which the program is run.
        os.chdir(run_dir)

        #Since there are multiple fastq refs, we download them and run Map Tnseq on each, and store the output files for a single
        # Design Random Pool Run.
        test_mode_bool = val_par['test_mode_bool']
        fastq_ref_list = val_par['fastq_ref_list']
        out_base = val_par['output_name']
        map_tnseq_filepaths = []
        if test_mode_bool == True:
            fastq_ref_list = [fastq_ref_list[0]]
        for i in range(len(fastq_ref_list)):
            crnt_fastq_ref = fastq_ref_list[i]
            logging.critical("crnt fq ref: " + crnt_fastq_ref)
            #Naming and downloading fastq/a file using DataFileUtil
            fastq_fn = "downloaded_fastq_file_" + str(i)
            fastq_fp = os.path.join(self.shared_folder, fastq_fn)
            get_shock_id_params = {"object_refs": [crnt_fastq_ref], "ignore_errors": False}
            get_objects_results = dfu_tool.get_objects(get_shock_id_params)
            fq_shock_id = get_objects_results['data'][0]['data']['lib']['file']['id']
            fastq_download_params = {'shock_id': fq_shock_id,'file_path': fastq_fp, 'unpack':'unpack'}
            #Here we download the fastq file itself:
            logging.info("DOWNLOADING FASTQ FILE NUMBER " + str(i+1))
            file_info = dfu_tool.shock_to_file(fastq_download_params)
            logging.info(file_info)
    
        
            """Test Files (Not online)
            genome_genbank_filepath = os.path.join(map_tnseq_dir, 'Test_Files/E_Coli_BW25113.gbk')
            genome_fna_fp = os.path.join(self.shared_folder, 'E_Coli_genbank.fna')
            SeqIO.convert(genome_genbank_filepath, "genbank", genome_fna_fp, "fasta")
            fastq_file_path = os.path.join(map_tnseq_dir,'Test_Files/fastq_test.fastq')
            model_file_path = os.path.join(map_tnseq_dir, 'Models/' + model_name)
            
            """
        
            #For each fastq reads file we run just MapTnSeq     
            #Running MapTnseq.pl------------------------------------------------------------------
    
            """
            A normal run would look like: 
            perl MapTnSeq.pl -tmpdir tmp -genome Test_Files/Ecoli_genome.fna -model Models/model_ezTn5_kan1 -first Test_Files/fastq_test > out1.txt
            """
            map_tnseq_out =  os.path.join(map_tnseq_return_dir, out_base + \
                    "_MapTnSeq_" + str(i) + ".tsv")
            map_tnseq_filepaths.append(map_tnseq_out)
            map_tnseq_cmnds = ["perl", "MapTnSeq.pl", "-tmpdir", tmp_dir, 
                                "-genome", genome_fna_fp, "-model", model_fp, 
                                '-first', fastq_fp]
            logging.info("RUNNING MAP TNSEQ ------")
            if test_mode_bool == True:
                map_tnseq_cmnds.append("-limit")
                map_tnseq_cmnds.append("1000")
            with open(map_tnseq_out, "w") as outfile:
                subprocess.call(map_tnseq_cmnds, stdout=outfile)
    
    
    
    
        #running Design Random Pool------------------------------------------------------------------

        pool_fp = os.path.join(design_pool_dir, out_base + ".pool")
        # -pool ../tmp/115_pool -genes gene_table_filepath MapTnSeq_File1.tsv MapTnSeq_File2.tsv ...
        design_r_pool_cmnds = ["perl","DesignRandomPool.pl","-pool",pool_fp, "-genes", gene_table_fp]
        if val_par['minN_bool']:
            design_r_pool_cmnds.append("-minN")
            design_r_pool_cmnds.append(str(val_par['minN']))
        if val_par['minFrac_bool']:
            design_r_pool_cmnds.append("-minFrac")
            design_r_pool_cmnds.append(str(val_par['minFrac']))
        if val_par['minRatio_bool']:
            design_r_pool_cmnds.append("-minRatio")
            design_r_pool_cmnds.append(str(val_par['minRatio']))

        # Adding the map tn seq files to the tail of the command
        for mts_fp in map_tnseq_filepaths:
            design_r_pool_cmnds.append(mts_fp)

        if not test_mode_bool:
            logging.info("RUNNING DESIGN RANDOM POOL ------")
            design_response = subprocess.run(design_r_pool_cmnds)
            logging.info("DesignRandomPool response: {}".format(str(design_response)))

        # Above Design Random Pool outputs a file to pool_fp
        
        # Now we upload the pool file to KBase to make a PoolFile Object
        if val_par['KB_Pool_Bool'] and not test_mode_bool:
            upload_params = {
                    'genome_ref': val_par['genome_ref'],
                    'pool_description': val_par['pool_description'] ,
                    'run_method': 'poolcount',
                    'workspace_id': workspace_id,
                    'ws_obj': ws,
                    'poolfile_fp': pool_fp,
                    'poolfile_name': out_base + ".pool",
                    'dfu': dfu_tool
                    }
            logging.info("UPLOADING POOL FILE to KBASE through DFU")
            upload_poolfile_results = upload_poolfile_to_KBase(upload_params)
            logging.info("Upload Pool File Results:")
            logging.info(upload_poolfile_results)
        
        
        #Returning file in zipped format:------------------------------------------------------------------
        
        file_zip_shock_id = dfu_tool.file_to_shock({'file_path': return_dir,
                                              'pack': 'zip'})['shock_id']

        dir_link = {
                'shock_id': file_zip_shock_id, 
               'name': main_output_name + '.zip', 
               'label':'map_tnseq_output_dir', 
               'description': 'The directory of outputs from running' \
                + ' Map TnSeq and Design Random Pool'
               }

        report_params = {
                'workspace_name' : params['workspace_name'],
                'file_links' : [dir_link]
                
                }

        report_info = report_util.create_extended_report(report_params)

        output = {
            'report_name': report_info['name'],
            'report_ref': report_info['ref'],
        }
        #END run_map_tnseq

        # At some point might do deeper type checking...
        if not isinstance(output, dict):
            raise ValueError('Method run_map_tnseq return value ' +
                             'output is not type dict as required.')
        # return the results
        return [output]
    def status(self, ctx):
        #BEGIN_STATUS
        returnVal = {'state': "OK",
                     'message': "",
                     'version': self.VERSION,
                     'git_url': self.GIT_URL,
                     'git_commit_hash': self.GIT_COMMIT_HASH}
        #END_STATUS
        return [returnVal]
