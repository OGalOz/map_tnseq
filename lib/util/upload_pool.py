#python3
# This file is to upload a pool file to KBasePoolTSV.PoolFile

import logging
import re
import datetime


def upload_poolfile_to_KBase(up):
    '''
<<<<<<< Updated upstream
    Inputs:
        up: d,
            username:
            genome_ref,:
            pool_description:
            fastq_refs (list):
            workspace_id:
            ws_obj:
            poolfile_fp: 
            poolfile_name:
            dfu:

=======
    upload params (up) must include:
    {
    username,
    genome_ref,
    pool_description,
    fastq_refs (list),
    workspace_id,
    ws_obj,
    poolfile_fp
    poolfile_name
    dfu
       }
>>>>>>> Stashed changes
    '''
    # We check correctness of pool file
    column_header_list = check_pool_file(up['poolfile_fp'])
    if len(column_header_list) != 12:
        logging.info(
            "WARNING: Number of columns is not 12 as expected: {}".format(
                len(column_header_list)
            )
        )
    # We create the handle for the object:
    file_to_shock_result = up['dfu'].file_to_shock(
        {"file_path": up['poolfile_fp'], "make_handle": True, "pack": "gzip"}
    )
    # The following var res_handle only created for simplification of code
    res_handle = file_to_shock_result["handle"]

    #util_die We create an updated description (prefix) with username and time.
    date_time = datetime.datetime.utcnow() 
    updated_description = "\nCreated by {} on {}\n".format(up['username'],
        str(date_time))

    # We create the data for the object
    pool_data = {
        "file_type": "KBasePoolTSV.PoolFile",
        "poolfile": res_handle["hid"],
        # below should be shock
        "handle_type": res_handle["type"],
        "shock_url": res_handle["url"],
        "shock_node_id": res_handle["id"],
        "compression_type": "gzip",
        "column_header_list": column_header_list,
        "file_name": res_handle["file_name"],
        "utc_created": str(date_time),
        "related_genome_ref": up["genome_ref"],
        "related_organism_scientific_name": get_genome_organism_name(
            up["genome_ref"],
            up['ws_obj']
        ),
        "description": updated_description + up["pool_description"],
    }

    save_object_params = {
        "id": up["workspace_id"],
        "objects": [
            {
                "type": "KBasePoolTSV.PoolFile",
                "data": pool_data,
                "name": up['poolfile_name'],
            }
        ],
    }
    # save_objects returns a list of object_infos
    dfu_object_info = up['dfu'].save_objects(save_object_params)[0]
    print("dfu_object_info: ")
    print(dfu_object_info)
    return {
        "Name": dfu_object_info[1],
        "Type": dfu_object_info[2],
        "Date": dfu_object_info[3],
    }


def check_pool_file(poolfile_fp):
    """
    We check the pool file by initializing into dict format

    The function "init_pool_dict" runs the tests to see if the file is
    correct.
    """
    col_header_list = []
    # Parse pool file and check for errors
    test_vars_dict = {"poolfile": poolfile_fp, "report_dict": {"warnings": []}}
    try:
        col_header_list = init_pool_dict(test_vars_dict)
    except Exception:
        logging.warning(
            "Pool file seems to have errors - " + "Please check and reupload."
        )
        raise Exception
    return col_header_list


def init_pool_dict(vars_dict):

    # pool dict is rcbarcode to [barcode, scaffold, strand, pos]
    pool = {}
    with open(vars_dict["poolfile"], "r") as f:
        poolfile_str = f.read()
        poolfile_lines = poolfile_str.split("\n")
        column_header_list = [x.strip() for x in poolfile_lines[0].split("\t")]
        for pool_line in poolfile_lines:
            pool_line.rstrip()
            pool = check_pool_line_and_add_to_pool_dict(
                pool_line, pool, vars_dict
            )
    if len(pool.keys()) == 0:
        raise Exception("No entries in pool file")
    return column_header_list


def check_pool_line_and_add_to_pool_dict(pool_line, pool, vars_dict):
    """
    For a pool line to be correct it has to follow a few rules.

    We care about the first 7 columns of each pool line.
    The first line in the file is the headers, and the first 7 are
    barcode, rcbarcode, nTot, n, scaffold, strand, pos
    Both the barcodes and rcbarcodes must be entirely made up of
    characters from "ACTG". Position must be made up of any number
    of digits (including 0). Strand is from "+","-","".
    If the rcbarcode already exists in the pool, then there is a
    problem with the pool file. Each rcbarcode must be unique.
    """
    # We get first 7 columns of pool_line (out of 12)
    split_pool_line = pool_line.split("\t")[:7]
    # We remove spaces:
    for x in split_pool_line:
        x.replace(" ", "")
    if len(split_pool_line) >= 7:
        # We unpack
        (
            barcode,
            rcbarcode,
            undef_1,
            undef_2,
            scaffold,
            strand,
            pos,
        ) = split_pool_line
    else:
        warning_text = "pool file line with less than 7 tabs:\n{}".format(pool_line)
        vars_dict["report_dict"]["warnings"].append(warning_text)
        logging.warning(warning_text)
        barcode = "barcode"
    if barcode == "barcode":
        # Header line
        pass
    else:
        if not re.search(r"^[ACGT]+$", barcode):
            logging.debug(len(barcode))
            raise Exception("Invalid barcode: |{}|".format(barcode))
        if not re.search(r"^[ACGT]+$", rcbarcode):
            raise Exception("Invalid rcbarcode: |{}|".format(rcbarcode))
        if not (pos == "" or re.search(r"^\d+$", pos)):
            raise Exception("Invalid position: |{}|".format(pos))
        if not (strand == "+" or strand == "-" or strand == ""):
            raise Exception("Invalid strand: |{}|".format(strand))
        if rcbarcode in pool:
            raise Exception("Duplicate rcbarcode.")
        pool[rcbarcode] = [barcode, scaffold, strand, pos]
    return pool


def get_genome_organism_name(genome_ref, ws_obj):
    res = ws_obj.get_objects2(
        {
            "objects": [
                {
                    "ref": genome_ref,
                    "included": ["scientific_name"],
                }
            ]
        }
    )
    scientific_name = res["data"][0]["data"]["scientific_name"]
    return scientific_name
