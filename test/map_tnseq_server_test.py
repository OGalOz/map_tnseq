# -*- coding: utf-8 -*-
import os
import time
import unittest
import logging
import copy
from configparser import ConfigParser

from map_tnseq.map_tnseqImpl import map_tnseq
from map_tnseq.map_tnseqServer import MethodContext
from map_tnseq.authclient import KBaseAuth as _KBaseAuth

from installed_clients.WorkspaceClient import Workspace


class map_tnseqTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        token = os.environ.get('KB_AUTH_TOKEN', None)
        config_file = os.environ.get('KB_DEPLOYMENT_CONFIG', None)
        cls.cfg = {}
        config = ConfigParser()
        config.read(config_file)
        for nameval in config.items('map_tnseq'):
            cls.cfg[nameval[0]] = nameval[1]
        # Getting username from Auth profile for token
        authServiceUrl = cls.cfg['auth-service-url']
        auth_client = _KBaseAuth(authServiceUrl)
        user_id = auth_client.get_user(token)
        # WARNING: don't call any logging methods on the context object,
        # it'll result in a NoneType error
        cls.ctx = MethodContext(None)
        cls.ctx.update({'token': token,
                        'user_id': user_id,
                        'provenance': [
                            {'service': 'map_tnseq',
                             'method': 'please_never_use_it_in_production',
                             'method_params': []
                             }],
                        'authenticated': 1})
        cls.wsURL = cls.cfg['workspace-url']
        cls.wsClient = Workspace(cls.wsURL)
        cls.serviceImpl = map_tnseq(cls.cfg)
        cls.scratch = cls.cfg['scratch']
        cls.callback_url = os.environ['SDK_CALLBACK_URL']
        suffix = int(time.time() * 1000)
        cls.wsName = "mapTnSeq_Test_" + str(suffix)
        cls.MTS_Test_Defaults = {
           'workspace_name': cls.wsName,
           'maxReads': None,
           'minQuality': 5,
           'minIdentity': 90,
           'minScore': 15,
           'delta': 5,
           'minN': 5,
           'minFrac': 0.75,
           'minRatio': 8.0,
           'maxQBeg': 3.0,
           'KB_Pool_Bool': "no"
        }
        ret = cls.wsClient.create_workspace({'workspace': cls.wsName})  # noqa

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, 'wsName'):
            cls.wsClient.delete_workspace({'workspace': cls.wsName})
            print('Test workspace was deleted')


    """
    Test options:
        minQuality = 0
        minIdentity = 99 
        Multiple scaffolds in a genome
    """

    # NOTE: According to Python unittest naming rules test method names should start from 'test'. # noqa
    def test1(self):
        ##
        ## Default Test (Quick)
        ##
        #"" 
        # Dyella Japonica
        genome_ref = "63063/9/1" 
        fastq_ref_list = ["63063/7/1"]
        tnseq_model_name = "pKMW3_universal"
        pool_description = "Testing"
        output_name = "Test1"
        test_d = copy.deepcopy(self.MTS_Test_Defaults)
        test_d["genome_ref"] = genome_ref
        test_d["fastq_ref_list"] = fastq_ref_list
        test_d["tnseq_model_name"] = tnseq_model_name
        test_d["pool_description"] = pool_description 
        test_d["output_name"] = output_name 
        test_d["KB_Pool_Bool"] = "yes"
        test_d["app_test"] = True 
        #test_d["yy"] = yy 
        ret = self.serviceImpl.run_map_tnseq(self.ctx, test_d)
        # Check ret:
        logging.info("Finished running test 1. Results:")
        logging.info(ret)
        #raise Exception("Stop testing")
        #""
        #pass

    '''
    def test2(self):
        ## Test Purpose:
        ##     Multiple FASTQ files
        ##     & minQuality = 0 
        #""

        genome_ref = "63063/9/1" 
        fastq_ref_list = ["63063/7/1", "63063/11/1", "63063/13/1"]
        tnseq_model_name = "pKMW3_universal"
        pool_description = "Testing"
        output_name = "Test1"
        test_d = copy.deepcopy(self.MTS_Test_Defaults)
        test_d["genome_ref"] = genome_ref
        test_d["fastq_ref_list"] = fastq_ref_list
        test_d["tnseq_model_name"] = tnseq_model_name
        test_d["pool_description"] = pool_description 
        test_d["output_name"] = output_name 
        test_d["minQuality"] = 0 
        test_d["app_test"] = True 
        #test_d["yy"] = yy 
        ret = self.serviceImpl.run_map_tnseq(self.ctx, test_d)
        # Check ret:
        logging.info("Finished running test 2. Results:")
        logging.info(ret)
        #""
        #pass
    def test3(self):
        ## Test Purpose:
        ##    New Genome (E Coli Keio) and FASTQs
        ##    & minIdentity = 99

        # E Coli
        genome_ref = "63063/3/1" 
        fastq_ref_list = ["63063/2/1"]
        tnseq_model_name = "Sc_Tn5"
        pool_description = "Testing"
        output_name = "Test1"
        test_d = copy.deepcopy(self.MTS_Test_Defaults)
        test_d["genome_ref"] = genome_ref
        test_d["fastq_ref_list"] = fastq_ref_list
        test_d["tnseq_model_name"] = tnseq_model_name
        test_d["pool_description"] = pool_description 
        test_d["output_name"] = output_name 
        test_d["minIdentity"] = 99
        test_d["app_test"] = True 
        #test_d["yy"] = yy 
        ret = self.serviceImpl.run_map_tnseq(self.ctx, test_d)
        # Check ret:
        logging.info("Finished running test 3. Results:")
        logging.info(ret)
        #pass
     
    '''
    '''
    def test4(self):
        ## Test Purpose:
        ##    New Genome (E Coli Keio) and FASTQs
        ##    & minIdentity = 1

        # E Coli
        genome_ref = "63063/3/1" 
        fastq_ref_list = ["63063/2/1"]
        tnseq_model_name = "Sc_Tn5"
        pool_description = "Testing"
        output_name = "Test1"
        test_d = copy.deepcopy(self.MTS_Test_Defaults)
        test_d["genome_ref"] = genome_ref
        test_d["fastq_ref_list"] = fastq_ref_list
        test_d["tnseq_model_name"] = tnseq_model_name
        test_d["pool_description"] = pool_description 
        test_d["output_name"] = output_name 
        test_d["minIdentity"] = 1
        test_d["app_test"] = True 
        #test_d["yy"] = yy 
        ret = self.serviceImpl.run_map_tnseq(self.ctx, test_d)
        # Check ret:
        logging.info("Finished running test 4. Results:")
        logging.info(ret)
        #pass
    '''
