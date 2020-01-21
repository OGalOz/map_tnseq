# -*- coding: utf-8 -*-
#BEGIN_HEADER
import logging
import os
import subprocess

from installed_clients.KBaseReportClient import KBaseReport
from installed_clients.GenomeFileUtilClient import GenomeFileUtil
from installed_clients.AssemblyUtilClient import AssemblyUtil
from installed_clients.DataFileUtilClient import DataFileUtil
from installed_clients.WorkspaceClient import Workspace
from Bio import SeqIO
from my_util.conversions import convert_genbank_to_genome_table
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

        #We need the workspace object to get info on the workspace the app is running in.
        #token = os.environ.get('KB_AUTH_TOKEN', None)
        #ws = Workspace(self.ws_url, token=token)


        init_dir = os.getcwd()
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




        #Check params: Genome_Ref, Assembly_Ref, model_name, 
        # [optional] model_string

        if 'genome_ref' in params:
            genome_ref = params['genome_ref']
        else:
            raise Exception("Genome Ref not passed in params.")
        if 'fastq_ref' in params:
            #fastq_ref will be a list since there can be multiple.
            fastq_ref_list = params['fastq_ref']
        else:
            raise Exception("Fastq Ref not passed in params.")
        if "model_name" in params:
            model_name = params["model_name"]
        else:
            raise Exception("Model Name not passed in params.")
        if model_name == "Custom":
            if "custom_model_string" in params:
                custom_model_string = params["custom_model_string"]
            else:
                raise Exception("Model Name is Custom but no custom model string passed in params. Please restart the program with custom model included.")
        if 'output_name' in params:
            output_name = params['output_name']
        else:
            output_name = "Untitled"

        main_output_name = output_name

        #Downloading genome in genbank format and converting it to fna:
        gf_tool = GenomeFileUtil(self.callback_url)
        genome_nucleotide_meta = gf_tool.genome_to_genbank({'genome_ref': genome_ref})
        genome_genbank_filepath = genome_nucleotide_meta['genbank_file']['file_path']
        genome_fna_fn = "genome_fna"
        genome_fna_fp = os.path.join(self.shared_folder, genome_fna_fn)

        SeqIO.convert(genome_genbank_filepath, "genbank", genome_fna_fp, "fasta")

        out_base = "map_tn_seq_"
        gene_table_fp = os.path.join(gene_tables_dir, out_base + "gene_table.tsv")



        #We need a config_dict that depends on the genbank file.
        #For now we'll make it simply empty.
        config_dict = {}

        #This function makes the gene_table at the location gene_table_fp
        convert_genbank_to_genome_table(genome_genbank_filepath,gene_table_fp,config_dict)

        #Preparing the Model
        if model_name != "Custom":
            model_fp = os.path.join(map_tnseq_dir, 'primers/' + model_name)
            #Check if model file exists
            logging.critical("We check if model file exists:")
            if (os.path.exists(model_fp)):
                logging.critical(os.path.exists(model_fp))
            else:
                logging.critical(os.listdir(os.path.join(map_tnseq_dir, "primers")))
                raise Exception("Could not find model filepath: {}".format(model_fp))

        else:
            raise Exception("Program doesn't allow custom models as inputs yet.")

       

        #We change to the directory in which the program is run.
        os.chdir(run_dir)

        #Since there are multiple fastq refs, we download them and run Map Tnseq on each, and store the output files for a single
        # Design Random Pool Run.
        map_tnseq_filepaths = []
        for i in range(len(fastq_ref_list)):
            crnt_fastq_ref = fastq_ref_list[i]
            
            #Namind and downloading fastq/a file using DataFileUtil
            fastq_fn = "downloaded_fastq_file" + str(i)
            fastq_fp = os.path.join(self.shared_folder, fastq_fn)
            get_shock_id_params = {"object_refs": [crnt_fastq_ref], "ignore_errors": False}
            get_objects_results = dfu_tool.get_objects(get_shock_id_params)
            fq_shock_id = get_objects_results['data'][0]['data']['lib']['file']['id']
            fastq_download_params = {'shock_id': fq_shock_id,'file_path': fastq_fp, 'unpack':'unpack'}
            #Here we download the fastq file itself:
            logging.info("DOWNLOADING FASTQ FILE " + str(i))
            file_info = dfu_tool.shock_to_file(fastq_download_params)
            logging.info(file_info)
    
        
            """Test Files (Not online)
            genome_genbank_filepath = os.path.join(map_tnseq_dir, 'Test_Files/E_Coli_BW25113.gbk')
            genome_fna_fp = os.path.join(self.shared_folder, 'E_Coli_genbank.fna')
            SeqIO.convert(genome_genbank_filepath, "genbank", genome_fna_fp, "fasta")
            fastq_file_path = os.path.join(map_tnseq_dir,'Test_Files/fastq_test.fastq')
            model_file_path = os.path.join(map_tnseq_dir, 'Models/' + model_name)
            logging.critical(model_file_path)
            tmp_dir = self.shared_folder
            out_base = "tests_115"
            #"""
        
            #For each fastq reads file we run both MapTnSeq and Design Random Pool
    
            #Running MapTnseq.pl------------------------------------------------------------------
    
            """
            A normal run would look like: 
            perl MapTnSeq.pl -tmpdir tmp -genome Test_Files/Ecoli_genome.fna -model Models/model_ezTn5_kan1 -first Test_Files/fastq_test > out1.txt
            """
            map_tnseq_out =  os.path.join(map_tnseq_return_dir, out_base + "map_tn_seq" + str(i) + ".tsv")
            map_tnseq_filepaths.append(map_tnseq_out)
            map_tnseq_cmnds = ["perl", "MapTnSeq.pl", "-tmpdir", tmp_dir, "-genome", genome_fna_fp, "-model", model_fp, '-first', fastq_fp]
            logging.info("RUNNING MAP TNSEQ ------")
            with open(map_tnseq_out, "w") as outfile:
                subprocess.call(map_tnseq_cmnds, stdout=outfile)
    
    
    
    
        #running Design Random Pool------------------------------------------------------------------

        pool_fp = os.path.join(design_pool_dir, out_base + "pool" + str(i) + ".tsv")
        # -pool ../tmp/115_pool -genes gene_table_filepath MapTnSeq_File1.tsv MapTnSeq_File2.tsv ...
        design_r_pool_cmnds = ["perl","DesignRandomPool.pl","-pool",pool_fp, "-genes", gene_table_fp]
        for mts_fp in map_tnseq_filepaths:
            design_r_pool_cmnds.append(mts_fp)
        logging.info("RUNNING DESIGN RANDOM POOL ------")
        design_response = subprocess.run(design_r_pool_cmnds)
        logging.info("DesignRandomPool response: {}".format(str(design_response)))
    

        
        #Returning file in zipped format:------------------------------------------------------------------
        
        file_zip_shock_id = dfu_tool.file_to_shock({'file_path': return_dir,
                                              'pack': 'zip'})['shock_id']
        dir_link = {
                'shock_id': file_zip_shock_id, 
               'name': main_output_name + '.zip', 
               'label':'map_tnseq_output_dir', 
               'description': 'The directory of outputs from running Map TnSeq and Design Random Pool'
               }

        """
        file_to_shock_params = {'file_path': out_filepath, 'pack': 'gzip'}
        file_to_shock_output = dfu.file_to_shock(file_to_shock_params)
        shock_id = file_to_shock_output['shock_id']
        File_params = {'shock_id': shock_id, 'name': output_name}
        report_params = {'workspace_name' : params['workspace_name'], 
                'file_links' : [File_params]
                }
        """
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
