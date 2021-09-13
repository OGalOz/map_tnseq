#!/bin/bash

chome=$PWD
impl=$PWD/lib/map_tnseq/map_tnseqImpl.py
tst=$PWD/test/map_tnseq_server_test.py
util_dir=$PWD/lib/util
maptnseq_dir=$PWD/lib/map_tnseq/MapTnSeq_Program
tmp_dir=$PWD/test_local/workdir/tmp
ui_dir=$PWD/ui/narrative/methods/run_map_tnseq/
uspec=$ui_dir/spec.json
udisp=$ui_dir/display.yaml
Trash=$PWD/../Trash

# clean up
find . -name '.DS_Store' -type f -delete
