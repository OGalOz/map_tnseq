# map_tnseq

To understand what the program does and to
learn how to run the program on KBase, refer
to the PDF document in the directory 'documentation':
[KBase app Explanation](documentation/RBTnSeq_Mapping.pdf).
To test the app on your system as a developer,
download the repo, start up Docker Desktop,
run 'bash docker_fix.sh', then run 'kb-sdk test'.
Link to narrative tutorial on KBase:
[Tutorial](https://narrative.kbase.us/narrative/98832).


This is a [KBase](https://kbase.us) module generated by the [KBase Software Development Kit (SDK)](https://github.com/kbase/kb_sdk).

You will need to have the SDK installed to use this module. [Learn more about the SDK and how to use it](https://kbase.github.io/kb_sdk_docs/).

You can also learn more about the apps implemented in this module from its [catalog page](https://narrative.kbase.us/#catalog/modules/map_tnseq) or its [spec file]($module_name.spec).

# Setup and test

Add your KBase developer token to `test_local/test.cfg` and run the following:

```bash
$ make
$ kb-sdk test
```

After making any additional changes to this repo, run `kb-sdk test` again to verify that everything still works.

# Installation from another module

To use this code in another SDK module, call `kb-sdk install map_tnseq` in the other module's root directory.

# Help

You may find the answers to your questions in our [FAQ](https://kbase.github.io/kb_sdk_docs/references/questions_and_answers.html) or [Troubleshooting Guide](https://kbase.github.io/kb_sdk_docs/references/troubleshooting.html).
