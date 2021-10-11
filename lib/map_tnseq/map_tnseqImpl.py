# -*- coding: utf-8 -*-
#BEGIN_HEADER
import logging
import os
import subprocess
#import shutil

from installed_clients.KBaseReportClient import KBaseReport
from installed_clients.GenomeFileUtilClient import GenomeFileUtil
from installed_clients.AssemblyUtilClient import AssemblyUtil
from installed_clients.DataFileUtilClient import DataFileUtil
from installed_clients.WorkspaceClient import Workspace
from installed_clients.rbts_genome_to_genetableClient import rbts_genome_to_genetable
from full.FullProgram import CompleteRun
from util.PrepareIO import PrepareProgramInputs, PrepareUserOutputs, clear_dir
#END_HEADER


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
    GIT_URL = "https://github.com/OGalOz/map_tnseq.git"
    GIT_COMMIT_HASH = "379ae536ecbf7bc2f14a1a25d21aeba3c7b6647b"

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
        :returns: instance of type "ReportResults" -> structure: parameter
           "report_name" of String, parameter "report_ref" of String
        
        Args:
            params (d) contains keys:
                'workspace_name' (str): ,
                'genome_ref' (str): ,
                'tnseq_model_name' (str): ,
                'fastq_ref_list' list<str>: ,
                'maxReads' (int): ,
                'minQuality' (int): ,
                'minIdentity' (int): ,
                'minScore' (int): ,
                'delta' (int): ,
                'minN' (int): ,
                'minFrac' (float): ,
                'minRatio' (float): ,
                'maxQBeg' (int): ,
                'pool_description' (str): ,
                'KB_Pool_Bool' (bool): ,
                'output_name' (str): 

        Returns:
            list<output>, where output is a dict with keys "report_name" and 
                          "report_ref"

        Description:
            This is the primary starting point for the program.
            At first we create the classes 'dfu', 'gfu', 'genetable_obj',
            'ws'. These are all objects to help with the KBase interface.
            'dfu' and 'gfu' and 'ws' all allow us to easily download files and info 
            from the KBase workspace, whereas genetable_obj specifically helps
            in converting the Genome Object to a Gene Table as used by
            the program. 
            The var 'cfg_d' is a dict to be passed along to the rest of 
            the functions in order to not have too many function inputs
            and to keep the default variables organized.
            The function 'PrepareProgramInputs' downloads the needed files
            using the aforementioned objects (like 'dfu' and 'gfu') 
            and writes the config files for MapTnSeq and Design Random Pool.
            The details of how the MapTnSeq and Design Random Pool config
            dicts are generated is in the file 'PrepareIO' in the function
            'Create_MTS_DRP_config'.


        """
        # ctx is the context object
        # return variables are: output
        #BEGIN run_map_tnseq
        
        logging.basicConfig(level=logging.DEBUG)
        if len(os.listdir(self.shared_folder)) > 0:
            logging.info("Clearing scratch directory")
            clear_dir(self.shared_folder)

        # Preparing main classes - dfu, gfu, genetableobj, workspace
        dfu = DataFileUtil(self.callback_url)
        gfu = GenomeFileUtil(self.callback_url)
        genetable_obj = rbts_genome_to_genetable(self.callback_url)
        # We need the workspace object to get info on the workspace the app is running in.
        token = os.environ.get('KB_AUTH_TOKEN', None)
        ws = Workspace(self.ws_url, token=token)
        ws_info = ws.get_workspace_info({'workspace': params['workspace_name']})
        workspace_id = ws_info[0]

        td = self.shared_folder
        html_fp = os.path.join(td, "MapTnSeqReport.html")

        # Initializing config info 
        cfg_d = {
                "gfu": gfu,
                "dfu": dfu,
                "ws": ws,
                "ws_id": workspace_id,
                "gt_obj": genetable_obj,
                "username" : ctx['user_id'],
                "tmp_dir": td,
                "model_dir": td, 
                "gene_table_fp": os.path.join(td, "genes.GC"),
                "blat_cmd": "/kb/module/lib/map_tnseq/blat",
                "mts_tables_dir": os.path.join(td, "MTS_Tables"),
                "R_fp": "/kb/module/lib/map_tnseq/PoolStats.R",
                "R_op_fp": os.path.join(td, "R_results.txt"),
                "MTS_cfg_fp": os.path.join(td, "maptnseqconfig.json"),
                "DRP_cfg_fp": os.path.join(td, "designRPconfig.json"),
                "css_style_fp": "/kb/module/lib/map_tnseq/style.css"
        }
        
        '''
            "unmapped_fp": os.path.join(td, "UNMAPPED.fna"),
            "tmpFNA_fp": os.path.join(td,"TMP.fna"),
            "trunc_fp": os.path.join(td, "TRUNC.fna"),
            "endFNA_fp": os.path.join(td, "END.fna"),
        '''
        
        # We divide the program into 3 parts:
        # Part 1: Prepare to run program: Download necessary files, create configs
        pool_op_fp, vp, genome_scientific_name, mts_cfg_d, drp_cfg_d = PrepareProgramInputs(params, cfg_d)


        # Part 1.5: Prepare vars 
        cfg_d['pool_fp'] = pool_op_fp
        cfg_d["workspace_name"] = params["workspace_name"]
        cfg_d["Main_HTML_report_fp"] = html_fp

        # Part 2: Run the central part of the program using recently created config files
        CompleteRun(mts_cfg_d, drp_cfg_d,
                    cfg_d["tmp_dir"], pool_op_fp, genome_scientific_name,
                    vp["KB_Pool_Bool"], cfg_d, vp)


        # Part 3: Prepare final output to return to user
        report_params = PrepareUserOutputs(vp, cfg_d)

        #Returning file in zipped format:-------------------------------------
        report_util = KBaseReport(self.callback_url)
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
