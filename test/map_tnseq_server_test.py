# -*- coding: utf-8 -*-
import os
import time
import unittest
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
        ret = cls.wsClient.create_workspace({'workspace': cls.wsName})  # noqa

    @classmethod
    def tearDownClass(cls):
        if hasattr(cls, 'wsName'):
            cls.wsClient.delete_workspace({'workspace': cls.wsName})
            print('Test workspace was deleted')

    # NOTE: According to Python unittest naming rules test method names should start from 'test'. # noqa
    def test_your_method(self):
        # Prepare test objects in workspace if needed using
        # self.getWsClient().save_objects({'workspace': self.getWsName(),
        #                                  'objects': []})
        #
        # Run your method by
        # ret = self.getImpl().your_method(self.getContext(), parameters...)
        #
        # Check returned data with
        # self.assertEqual(ret[...], ...) or other unittest methods
        
        genome_ref = "49371/5/1" 
        fastq_ref_list = ["49371/2/1"]
        model_name = "model_ezTn5_kan1" #"Custom" #
        custom_model_string = "Arbitrary"
        maxReads = 10000
        minQuality = 5
        minIdentity = 90.0
        minScore = 15
        minN = 5 #Restriction: Must be at least 1. 
        minFrac = 0.75 #Range 0-1
        minRatio = 8.0 #Range 0 -inf.
        maxQBeg = 3.0
        pool_description = "Ci Testing"
        KB_Pool_Bool = "yes"
        output_name = "init_test"

        ret = self.serviceImpl.run_map_tnseq(self.ctx, {'workspace_name': self.wsName,
                                                        'genome_ref': genome_ref ,
                                                        'fastq_ref_list': fastq_ref_list,
                                                        'model_name': model_name,
                                                        'custom_model_string' : custom_model_string,
                                                        'maxReads': maxReads,
                                                        'minQuality': minQuality,
                                                        'minIdentity': minIdentity,
                                                        'minScore': minScore,
                                                        'minN': minN,
                                                        'minFrac': minFrac,
                                                        'minRatio': minRatio,
                                                        'maxQBeg': maxQBeg,
                                                        'pool_description': pool_description,
                                                        'KB_Pool_Bool': KB_Pool_Bool,
                                                        'output_name': output_name,
                                                            })
