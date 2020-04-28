#python3
import os
import logging

def validate_init_params(params, map_tnseq_dir):

    #Validated params dict
    vp = {}

    if 'genome_ref' in params:
        vp['genome_ref'] = params['genome_ref']
    else:
        raise Exception("Genome Ref not passed in params.")
    if 'fastq_ref' in params:
        #fastq_ref will be a list since there can be multiple.
        fq_ref_list = params['fastq_ref']
        if len(fq_ref_list) == 0:
            raise Exception("There must be at least 1 FASTQ file. None found.")
        vp['fastq_ref_list'] = params['fastq_ref']
    else:
        raise Exception("Fastq Ref not passed in params.")

    if "model_name" in params:
        vp['model_name'] = params["model_name"]
    else:
        raise Exception("Model Name not passed in params.")

    if vp['model_name'] == "Custom":
        if "custom_model_string" in params:
            vp['custom_model_string'] = params["custom_model_string"]
            vp['tested_model_string'] = validate_custom_model(vp[
                'custom_model_string'])
            f = open(os.path.join(map_tnseq_dir, 'primers/Custom'),"w")
            f.write(vp['tested_model_string'])
        else:
            raise Exception("Model Name is Custom but no custom model string "
            "passed in params.\n Please restart the program with "
            "custom model included.")

    if "test_mode" in params:
        if params["test_mode"] == "yes":
            vp['test_mode_bool'] = True
        else:
            # no
            vp['test_mode_bool'] = False
    else:
        raise Exception("Test Mode not passed in params.")

    if "minN" in params:
        if (params['minN'] != "" and params['minN'] is not None):
            vp['minN_bool'] = True
            vp['minN'] = params['minN']
            if vp['minN'] < 2:
                raise Exception("minN must be an integer greater than 1.\n" 
                        "Instead {}".format(vp['minN']))
        else:
            vp['minN_bool'] = False
    else:
        vp['minN_bool'] = False
    if "minFrac" in params:
        if (params['minFrac'] != ""and params['minFrac'] is not None):
            vp['minFrac_bool'] = True
            vp['minFrac'] = params['minFrac']
            if vp['minFrac'] < 0 or vp['minFrac'] > 1:
                raise Exception("minFrac must be between 0 and 1.\n"
                        "Instead {}".format(vp['minFrac']))
        else:
            vp['minFrac_bool'] = False
    else:
        vp['minFrac_bool'] = False

    if "minRatio" in params:
        if (params['minRatio'] != "" and params['minRatio'] is not None):
            vp['minRatio_bool'] = True
            vp['minRatio'] = params['minRatio']
            if vp['minRatio'] < 0:
                raise Exception("minRatio must be greater than or equal to 0.\n"
                        "Instead {}".format(vp['minRatio']))
        else:
            vp['minRatio_bool'] = False
    else:
        vp['minRatio_bool'] = False

    if "pool_description" in params:
        if params["pool_description"] == '' or params["pool_description"] is None:
            vp['pool_description'] = 'No description given.'
        else:
            vp['pool_description'] = params['pool_description']
    else:
        vp['pool_description'] = 'No description given.'

    if params['KB_Pool_Bool'] == 'yes':
        vp['KB_Pool_Bool'] = True
    else:
        vp['KB_Pool_Bool'] = False

    if 'output_name' in params:
        if (params['output_name'] != '' and params['output_name'] is not None):
            vp['output_name'] = check_output_name(params['output_name'])
        else:
            vp['output_name'] = "Untitled"
    else:
        vp['output_name'] = "Untitled"


    return vp



"""
Inputs: custom_model_string (str) String of custom model. 
    Should look like the other models (2 lines, etc)
Outputs: tested_model_string (str) String of custom model.
"""
def validate_custom_model(custom_model_string):

    if len(custom_model_string) < 2:
        raise Exception("Custom Model form incorrect, it contains fewer than 2 "
        "characters while it should be at least 20 bp long.")
        
    if len(custom_model_string.split("\n")) > 3:
        raise Exception("Custom Model form incorrect- max amount of lines is 2.")
    
    #For now there is minimal testing. Eventually add specific tests.
    tested_model_string = custom_model_string

    return tested_model_string


# op_name is string, (output_name for app)
def check_output_name(op_name):
    op_name = op_name.replace(' ', '_')
    rgx = re.search(r'[^\w]', op_name)
    if rgx:
        logging.warning("Non-alphanumeric character in output name: " + rgx[0])
        op_name = "Default_Name_Check_Chars"
    return op_name
