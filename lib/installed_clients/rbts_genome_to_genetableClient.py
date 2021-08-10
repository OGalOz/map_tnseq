# -*- coding: utf-8 -*-
############################################################
#
# Autogenerated by the KBase type compiler -
# any changes made here will be overwritten
#
############################################################

from __future__ import print_function
# the following is a hack to get the baseclient to import whether we're in a
# package or not. This makes pep8 unhappy hence the annotations.
try:
    # baseclient and this client are in a package
    from .baseclient import BaseClient as _BaseClient  # @UnusedImport
except ImportError:
    # no they aren't
    from baseclient import BaseClient as _BaseClient  # @Reimport


class rbts_genome_to_genetable(object):

    def __init__(
            self, url=None, timeout=30 * 60, user_id=None,
            password=None, token=None, ignore_authrc=False,
            trust_all_ssl_certificates=False,
            auth_svc='https://ci.kbase.us/services/auth/api/legacy/KBase/Sessions/Login',
            service_ver='dev',
            async_job_check_time_ms=100, async_job_check_time_scale_percent=150, 
            async_job_check_max_time_ms=300000):
        if url is None:
            raise ValueError('A url is required')
        self._service_ver = service_ver
        self._client = _BaseClient(
            url, timeout=timeout, user_id=user_id, password=password,
            token=token, ignore_authrc=ignore_authrc,
            trust_all_ssl_certificates=trust_all_ssl_certificates,
            auth_svc=auth_svc,
            async_job_check_time_ms=async_job_check_time_ms,
            async_job_check_time_scale_percent=async_job_check_time_scale_percent,
            async_job_check_max_time_ms=async_job_check_max_time_ms)

    def run_rbts_genome_to_genetable(self, params, context=None):
        """
        This example function accepts any number of parameters and returns results in a KBaseReport
        :param params: instance of mapping from String to unspecified object
        :returns: instance of type "ReportResults" -> structure: parameter
           "report_name" of String, parameter "report_ref" of String
        """
        return self._client.run_job('rbts_genome_to_genetable.run_rbts_genome_to_genetable',
                                    [params], self._service_ver, context)

    def genome_to_genetable(self, params, context=None):
        """
        :param params: instance of type "GeneTableParams" (genome_ref is the
           ref of the genome) -> structure: parameter "genome_ref" of String
        :returns: instance of type "GenomeToGeneTableResult" (exit_code (int)
           success is 0, failure is 1 filepath (str) path to where the gene
           table is) -> structure: parameter "exit_code" of Long, parameter
           "filepath" of String
        """
        return self._client.run_job('rbts_genome_to_genetable.genome_to_genetable',
                                    [params], self._service_ver, context)

    def status(self, context=None):
        return self._client.run_job('rbts_genome_to_genetable.status',
                                    [], self._service_ver, context)