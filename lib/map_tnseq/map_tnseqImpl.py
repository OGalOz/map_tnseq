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
        
        #We need the workspace object to get info on the workspace the app is running in.
        #token = os.environ.get('KB_AUTH_TOKEN', None)
        #ws = Workspace(self.ws_url, token=token)
        
        #Check params: Genome_Ref, Assembly_Ref, model_name, 
        # [optional] model_string
        if 'genome_ref' in params:
            genome_ref = params['genome_ref']
        else:
            raise Exception("Genome Ref not passed in params.")
        if 'fastq_ref' in params:
            fastq_ref = params['fastq_ref']
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

        """REAL
        #Downloading genome in genbank format and converting it to fna:
        gf_tool = GenomeFileUtil(self.callback_url)
        genome_nucleotide_meta = gf_tool.genome_to_genbank({'genome_ref': genome_ref})
        genome_genbank_filepath = genome_nucleotide_meta['genbank_file']['file_path']
        genome_fna_file_name = "genome_fna"
        SeqIO.convert(genome_genbank_filepath, "genbank", os.path.join(self.shared_folder, genome_fna_file_name, "fasta"))
        genome_nucleotide_file_path = os.path.join(self.shared_folder, genome_fna_file_name)

        #Downloading fastq/a file using DataFileUtil
        dfu_tool = DataFileUtil(self.callback_url)
        fastq_download_params = {"object_refs": [fastq_ref], "ignore_errors": False}
        get_objects_results = dfu_tool.get_objects(fastq_download_params)
        logging.critical(get_objects_results)
        raise Exception("Stop")

        if model_name != "Custom":
            model_file_path = os.path.join(Map_Tnseq_dir, 'Models/' + model_name)
        else:
            raise Exception("Program doesn't allow custom models as inputs yet.")

        """

        #Essential
        init_dir = os.getcwd()
        os.chdir("/kb/module")
        cwd = "/kb/module"
        logging.critical(cwd)
        Map_Tnseq_dir = os.path.join(cwd, 'lib/map_tnseq/MapTnSeq_Program')
        logging.critical(os.listdir(cwd))
        logging.critical(os.listdir('/kb/module'))


        #"""Test
        genome_nucleotide_file_path = os.path.join(Map_Tnseq_dir, 'Test_Files/Ecoli_genome.fna')
        fastq_file_path = os.path.join(Map_Tnseq_dir,'Test_Files/fastq_test')
        model_file_path = os.path.join(Map_Tnseq_dir, 'Models/' + model_name)
        logging.critical(model_file_path)
        tmp_dir = self.shared_folder
        out_filepath = os.path.join(self.shared_folder, "out_1_test.txt")
        #"""
        #Running MapTnseq.pl
        # normal run: perl MapTnSeq.pl -tmpdir tmp -genome Test_Files/Ecoli_genome.fna -model Models/model_ezTn5_kan1 -first Test_Files/fastq_test > out1.txt
        os.chdir(Map_Tnseq_dir)
        cmnds = ["perl", "MapTnSeq.pl", "-tmpdir", tmp_dir, "-genome", genome_nucleotide_file_path, "-model", model_file_path, '-first', fastq_file_path]

        with open(out_filepath,"w") as outfile:
            subprocess.call(cmnds, stdout=outfile)


        #Returning file in zipped format:
        dfu = DataFileUtil(self.callback_url)
        file_to_shock_params = {'file_path': out_filepath, 'pack': 'gzip'}
        file_to_shock_output = dfu.file_to_shock(file_to_shock_params)
        shock_id = file_to_shock_output['shock_id']
        File_params = {'shock_id': shock_id, 'name': output_name}
        report_params = {'workspace_name' : params['workspace_name'], 
                'file_links' : [File_params]
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
