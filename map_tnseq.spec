/*
A KBase module: map_tnseq
*/

module map_tnseq {

    /*
        The following are the values in the columns of the TSV file 
        the program MapTnSeq returns.

    */

    /*
    Read Name: The name of the read which this comes from.
    */
    typedef string read_name;

    /*
    barcode: the barcode itself (A,C,T,G)
    */
    typedef string barcode;

    /*
    scaffold number (which scaffold the insertion lies in).
    */
    typedef int scaffold;

    /*
    position of insertion (Position in scaffold in which insertion lies)
    */
    typedef int insertion_position;

    /*
    Strand that the read matched ('+' or '-')
    Limited Vocab string
    */
    typedef string strand;

    /*
    Boolean flag for if this mapping location is unique or not.
    1 means unique, 0 means not unique?
    */
    typedef int unique_flag;

    /*
    Integer representing the beginning of the hit to the genome in 
    the read after trimming the transposon sequence
    */
    typedef int begin_hit_loc;

    /*
    Integer representing the end of the hit to the genome in 
    the read after trimming the transposon sequence.
    */
    typedef int end_hit_loc;

    /*
    The bit score
    */
    typedef float bit_score;


    /*
    The percent identity
    */
    typedef float percent_identity;






    typedef structure {
        string report_name;
        string report_ref;
    } ReportResults;

    /*
        This example function accepts any number of parameters and returns results in a KBaseReport
    */
    funcdef run_map_tnseq(mapping<string,UnspecifiedObject> params) returns (ReportResults output) authentication required;

};
