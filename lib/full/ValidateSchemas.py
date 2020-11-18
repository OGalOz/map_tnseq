#!python3
# We validate schemas for MapTnSeq here

import os
import sys
import logging
import json
import fastjsonschema


def Validator(schema_fp, json_fp):
    with open(schema_fp, "r") as f:
        validate = fastjsonschema.compile(json.loads(f.read()))
    with open(json_fp, "r") as f:
            validate(json.loads(f.read()))

    print("validated {} against {}".format(schema_fp, json_fp))


def test():

    return None

def main():

    args = sys.argv
    if args[-1] in ["how", "help"]:
        print("python3 ValidateSchemas.py schemafile input_file_to_validate 1")
    elif args[-1] == "1":
        Validator(args[1], args[2])

    else:
        raise Exception("Invalid running of file, try running 'python3 ValidateSchemas.py help'")
        
    return None

if __name__ == "__main__":
    main()
