#!python3

# This file is a baseline python file

import os
import sys
import logging
import json
import shutil

def CreateHTMLdir(tmp_dir, html_display_files_dir):
    """
    We create the HTML directory in the tmp dir.
    We need to copy baseline files from html_display_files_dir to this directory
    This is where the information for the HTML directory is decided (no config)
    Args:
        both are paths to directories
    """
    html_dir = os.path.join(tmp_dir, "HTML")
    os.mkdir(html_dir)
    JS_dir = os.path.join(html_dir, "JS")
    os.mkdir(JS_dir)
    MH_dir = os.path.join(JS_dir, "MH")
    os.mkdir(MH_dir)
    EBC_dir = os.path.join(JS_dir, "EBC")
    os.mkdir(EBC_dir)
    stats_dir = os.path.join(JS_dir, "StatsDisplay")
    os.mkdir(stats_dir)

    shutil.move(os.path.join(html_display_files_dir, "FullDisplay_index.html"), html_dir)
    shutil.move(os.path.join(html_display_files_dir, "FullDisplay_Defaults.js"), JS_dir)
    shutil.move(os.path.join(html_display_files_dir, "FullDisplayFuncs.js"), JS_dir)
    shutil.move(os.path.join(html_display_files_dir, "LayoutUtil.js"), JS_dir)
    shutil.move(os.path.join(html_display_files_dir, "d3-zoom.min.js"), JS_dir)
    shutil.move(os.path.join(html_display_files_dir, "d3.min.js"), JS_dir)
    shutil.move(os.path.join(html_display_files_dir, "BCExpandingBarChartFuncs.js"), EBC_dir)
    shutil.move(os.path.join(html_display_files_dir, "BCDefaults.js"), EBC_dir)
    shutil.move(os.path.join(html_display_files_dir, "MakeStatsDiv.js"), stats_dir)
    shutil.move(os.path.join(html_display_files_dir, "StatsDefaults.js"), stats_dir)
    shutil.move(os.path.join(html_display_files_dir, "MhtnDefaults.js"), MH_dir)
    shutil.move(os.path.join(html_display_files_dir, "MhtnPlotExpandFuncs.js"), MH_dir)
    #shutil.move(os.path.join(html_display_files_dir, plc), res_dir)

    return [stats_dir, EBC_dir, MH_dir]
    



def CreateHTMLString(pre_HTML_d):

    # style link-'n'-tag
    stl_lnk_n_tag = getStyle()
    HTML_str = "<!DOCTYPE html>\n<html>\n<head>\n{}\n</head>\n<body>\n".format(stl_lnk_n_tag)

    HTML_str += CreateHTMLStringBody(pre_HTML_d)

    HTML_str += "</body></html>"

    return HTML_str




def CreateHTMLStringBody(pre_HTML_d):
    """
    Inputs:
        pre_HTML_d: (dict)
            models_str: (str) Info about Models
            genome_name: (str) Name of genome
            MapTnSeq_reports_list: (list) Each element is a MTS_report_d:
                MTS_report_d: (dict)
                    fastq_fp: The path to the fastq file
                    text_report_str: (str)
                    text_report_list: (list),
                    text_report_dict: (dict)
                        fastq_fn,
                        R_proc: int (reads processed)
                        long_enough: (int)
                        minRlen: (int) (minimum Read Length)
                        tot_BC: (int)
                        nTryToMap: (int)
                        nMapped: (int)
                        Uniquely_Mapped: (int)
                        total_hits_pastEnd: (int)
                        Hits_pE: (int) Total hits past End - nPastEndIgnored
                        nPastEndIgnored: (int)
                        nPastEndTrumps: (int)
                Note that nPastEndIgnored + nPastEndTrumps = Hits_pE.
                Hits_pE - nPastEndIgnored = hitsPastEnd written in Pool

            DRP_report_dict: (dict) The report dict from Design Random Pool
               nUsableBarcodes: (int)
               total_MTS_table_lines: (int)
               nMapped: (int)  The reads that counting matters
               nReadsForUsable: (int) This is the total number of reads that were used for barcodes
               Rlog_d : (dict) 'results dict'
                    failed: (bool) True if failed.
                    [Error_str]: existant if failed=True
                    insertions: (int)
                    diff_loc: (int)
                    cntrl_ins: (int)
                    cntrl_distinct: (int)
                    num_surp: (int) # number surprising insertions
                    stn_per_prtn_median: (int)
                    stn_per_prtn_mean: (float)
                    gene_trspsn_same_prcnt: (float) Strand Bias?
                    reads_per_prtn_median: (int)
                    reads_per_prtn_mean: (float)
                    reads_per_mil_prtn_median: (float)
                    reads_per_mil_prtn_mean: (float)


    We divide the HTML page into three sections:
        Models Report,
        Map Tn Seqs Reports, 
        and the Design Random Pool Report.
    Each will have a brief explanation as to what it did, (e.g. for MapTnSeq,
    "Took FastQ file _ and extracted information. Report: )
    """
    HTML_str = "<h1>Text Report on 'Reads to Mutant File'</h1>\n"
    HTML_str += "<h1>--------------------------------------</h1>\n"
    # Genome info 
    HTML_str += CreateGenomeInfo(pre_HTML_d["genome_name"])
    # Models info
    HTML_str += CreateModelInfo(pre_HTML_d["models_info"])
    # MapTnSeq info
    HTML_str += Create_HTML_MTS(pre_HTML_d["MapTnSeq_reports_list"])
    # Design Random Pool info
    HTML_str += Create_HTML_DRP(pre_HTML_d["DRP_report_dict"])

    return HTML_str


def CreateGenomeInfo(genome_name):
    # genome_name is string

    HTML_str = "<h2>RBTnSeq Analysis on Genome:</h2>\n"
    HTML_str += "<h3>{}</h3>\n".format(genome_name)
    HTML_str += "<h1>--------------------------------------</h1>\n"

    return HTML_str 

def CreateModelInfo(model_info_d):
    """
    model_info_d: (dict)
       model_in_use: (str)
    """
    mm = model_info_d['model_in_use']


    HTML_l = ["<h2> Information on Model: </h2>"]
    HTML_l += ["<h3> Using the following given Model:</h3>"]
    HTML_l += ["<h4>" + mm.split('/')[-1] + "</h4>"]
    HTML_l += ["<h1>--------------------------------------</h1>"]

    return "\n".join(HTML_l)





# We make a nice table for every MapTnSeq Report
def Create_HTML_MTS(MapTnSeq_reports_list):
    """
    MapTnSeq_reports_list: (list) Each element is a MTS_report_d:
                MTS_report_d: (dict)
                        fastq_fp: The path to the fastq file
                        text_report_str: (str)
                        text_report_list: (list)
                        text_report_dict: (dict)
                            fastq_fn: (str)
                            R_proc: int (reads processed)
                            long_enough: (int)
                            minRlen: (int) (minimum Read Length)
                            tot_BC: (int)
                            nTryToMap: (int)
                            nMapped: (int)
                            Uniquely_Mapped: (int)
                            total_hits_pastEnd: (int)
                            Hits_pE: (int) Total hits past End - nPastEndIgnored
                            nPastEndIgnored: (int)
                            nPastEndTrumps: (int)
            Note that nPastEndIgnored + nPastEndTrumps = Hits_pE.
            Hits_pE - nPastEndIgnored = hitsPastEnd written in Pool
            Can you add commas to the right spots in the ints?
            Can you make the floats with only 3 chars after the decimal?

    """
    MTS_HTML_str = "<h2>Reading FASTQ files </h2>\n" \
            + "<p>--------------------------------</p>\n"
    for MTS_report_d in MapTnSeq_reports_list:
        MTS_HTML_str += "<h4> Report extracting reads with barcodes from "
        MTS_HTML_str += MTS_report_d["text_report_dict"]["fastq_fn"] + "</h4>\n"
        MTS_HTML_str += Create_MTS_Table(MTS_report_d["text_report_dict"])
    MTS_HTML_str += "<p>---------------------------------------</p>"

    return MTS_HTML_str


def Create_MTS_Table(trd):
    """
    Inputs:
        trd: (dict) text_report_dict
            fastq_fn: (str)
            R_proc: int (reads processed)
            long_enough: (int)
            minRlen: (int) (minimum Read Length)
            tot_BC: (int)
            nTryToMap: (int)
            nMapped: (int)
            Uniquely_Mapped: (int)
            total_hits_pastEnd: (int)
            Hits_pE: (int) Total hits past End - nPastEndIgnored
            nPastEndIgnored: (int)
            nPastEndTrumps: (int)

    Outputs:
        HTML_str: (str)
        This should be a table with important information displayed neatly
            for user to understand.
    """
    #reads processed
    r = trd["R_proc"]

    HTML_l = ['<div class="rpt_tbl_div">']

    css_tbl_cls = "dataTable__table table table-striped table-bordered dataTable no-footer"
    HTML_l += ['<table class="{}">'.format(css_tbl_cls)]

    for info in [
            ['# Reads Processed ', prep_int(r)],
            ['# Reads that are longer than {}bp'.format(
                trd['minRlen']), prep_int(trd['long_enough'])],
            ['# Reads with Barcode', prep_int(trd['tot_BC'])],
            ['# Reads with Mapped Insertions', prep_int(trd['nMapped'])],
            ['# Reads that Map Uniquely', prep_int(trd['Uniquely_Mapped'])],
            ['# Reads that Map to Intact Vector', prep_int(trd['total_hits_pastEnd'])],
            ['% Reads that are longer than {}bp'.format(
               trd['minRlen']), Prc(float(trd['long_enough'])/float(r)) + "%"],
            ['% Reads with Barcode ', Prc(float(trd['tot_BC'])/float(r)) + "%"],
            ['% Reads with Mapped Insertions', Prc(float(trd['nMapped'])/float(r)) + "%"],
            ['% Reads that Map Uniquely', Prc(float(trd['Uniquely_Mapped'])/float(r)) + "%"],
            ['% Reads that Map to Intact Vector', Prc(float(trd['total_hits_pastEnd'])/float(r)) + "%"]
            ]:

        html_str = '<tr role="row" class="MTS_row">\n' \
                + '<td class="MTS_col_1">' + info[0] + '</td>\n' \
                + '<td class="MTS_col_2">' + str(info[1]) + '</td>\n' \
                + '</tr>'
        HTML_l.append(html_str)

    HTML_l.append("</table>\n")
    HTML_l.append("</div>\n")

    return "\n".join(HTML_l)



def Create_HTML_DRP(DRP_report_dict):
    """
    input is dict with the following keys:

       nUsableBarcodes: (int)
       total_MTS_table_lines: (int)
       nMapped: (int)
       nReadsForUsable: (int) This is the total number of reads that were used for barcodes
       Rlog_d : (dict) 'results dict'
            failed: (bool) True if failed.
            [Error_str]: existant if failed=True
            insertions: (int)
            diff_loc: (int)
            cntrl_ins: (int)
            cntrl_distinct: (int)
            nPrtn_cntrl: (int)
            num_surp: (int) # number surprising insertions
            stn_per_prtn_median: (int)
            stn_per_prtn_mean: (float)
            gene_trspsn_same_prcnt: (float) Strand Bias?
            reads_per_prtn_median: (int)
            reads_per_prtn_mean: (float)
            reads_per_mil_prtn_median: (float)
            reads_per_mil_prtn_mean: (float)
    """
    rd = DRP_report_dict
    rl = rd["Rlog_d"]

    HTML_l = ["<h2>Mutant Pool Report</h2>"]

    HTML_l += ['<div id="DRP_table" class="rpt_tbl_div">']
    
    css_tbl_cls = "dataTable__table table table-striped table-bordered dataTable no-footer"
    HTML_l += ['<table class="{}">'.format(css_tbl_cls)]

    if rl["failed"]:
        for info in [
                ['# Usable Barcodes ', prep_int(rd['nUsableBarcodes'])],
                ['% Coverage of mapped reads by usable barcodes', 
                    Prc(float(rd['nReadsForUsable'])/(float(rd['nMapped']) + 10**-6)) + "%" ]
                ]:
            html_str = '<tr role="row" class="DRP_row">\n' \
                    + '<td class="DRP_col_1">' + info[0] + '</td>\n' \
                    + '<td class="DRP_col_2">' + str(info[1]) + '</td>\n' \
                    + '</tr>'
            HTML_l.append(html_str)
    else:
        for info in [
                ['# Usable Barcodes ', prep_int(rd['nUsableBarcodes'])],
                ['% Coverage of mapped reads by usable barcodes', 
                    Prc(float(rd['nReadsForUsable'])/(float(rd['nMapped']) + 10**-6)) + "%" ],
                ['# Protein-Coding Genes with Central Insertion(s)', prep_int(rl['nPrtn_cntrl']) ],
                ['# Central Insertions in Protein Coding Genes ', prep_int(rl['cntrl_ins'])],
                ['# Putatively Essential Genes with Insertions', prep_int(rl['num_surp'])],
                ['Reads per Protein: Mean ', rl['reads_per_prtn_mean']],
                ['Reads per Protein: Median', prep_int(rl['reads_per_prtn_median'])],
                ['Reads per Protein: Bias (mean/median)',
                    str(round(float(rl['reads_per_prtn_mean'])/float(rl['reads_per_prtn_median']), 3)) ],
                ['% Of Insertions in Protein-Coding Genes on the Coding Strand', 
                    str(round(rl['gene_trspsn_same_prcnt'],3)) + "%"]
                ]:
            html_str = '<tr role="row" class="DRP_row">\n' \
                    + '<td class="DRP_col_1">' + info[0] + '</td>\n' \
                    + '<td class="DRP_col_2">' + str(info[1]) + '</td>\n' \
                    + '</tr>'
            HTML_l.append(html_str)

    HTML_l.append('</table>\n')
    HTML_l.append("</div>\n")

    return "\n".join(HTML_l)

    

def prep_int(inp_i):
    # inp_i is an int or float with no decimal nonzero digits, value will be converted into
    # string and have commas: 1000000 -> '1,000,000'
    # OR inp_i is '?'
    
    # converting floats into ints and ints into strings and strings into lists
    if inp_i != '?':
        x = list(str(int(inp_i)))
    else:
        return '?'

    op_str = ''
    while len(x) > 3:
        c_char = x.pop(0)
        op_str += c_char
        if len(x) % 3 == 0:
            op_str += ","

    op_str += ''.join(x) 

    return op_str


def Prc(flt):
    #flt is a fraction to be turned into percent and cut short to 3 decimals
    # returns string
    if flt <= 1.01 and flt > -0.01:
        flt = str(flt*100)
    else:
        return str("Percent Error? " + str(flt) )
    """
    elif flt > 100.1:
        return "Error prcnt over 100?"
    elif flt < -0.01:
        # Negative?
        return "Error unknown prcnt."
    else:
        # float is already a percent form fraction? 
        # - Note what if percent is actually less than 1??
    """

    # We split the float into before decimal and after
    l = flt.split(".")
    # We round the after-decimal part
    ad = l[1][:2]
    if int(ad[-1]) > 4:
        ad = str(int(ad[0]) + 1)
    else:
        ad = str(int(ad[0]))

    op = l[0] + "." + ad

    return op 


def getStyle():
    """
    returns string of style. First links, and then the style tag
    """
    style_link = '<link rel="stylesheet" href="style.css">\n' 
    style_tag = '<style>\n.rpt_tbl_div {margin: auto; width:60%;}\n'
    style_tag += 'h1 {text-align:center;}\nh2 {text-align:center;}\nh3 {text-align:center;}\n'
    style_tag += 'h4 {text-align:center;}\np {text-align:center;}\n'
    style_tag += '</style>'

    opt_HTML_style = """
    table, th, td {
              border: 1px solid black;
                border-collapse: collapse;
                }
    th, td {
              padding: 15px;
                text-align: left;
                }
    #t01 tr:nth-child(even) {
      background-color: #eee;
          }
          #t01 tr:nth-child(odd) {
           background-color: #fff;
               }
               #t01 th {
                 background-color: black;
                   color: white;
                   }\n
                """
    return style_link + style_tag


def GetSingleModelHTML(good_models_list):
    """
    good_models_list: (list) list of lists, each sublist [model_fp, value]
    """

    # style link-'n'-tag
    stl_lnk_n_tag = getStyle()
    HTML_str = "<!DOCTYPE html>\n<html>\n<head>\n{}\n</head>\n<body>\n".format(stl_lnk_n_tag)

    HTML_l = ["<h2> Information on Model: </h2>"]
    HTML_l += ["<h3> The following models had barcodes found in first 10,000 reads:</h3>"]

    HTML_l += ['<div id="DRP_table" class="rpt_tbl_div">']
    css_tbl_cls = "dataTable__table table table-striped table-bordered dataTable no-footer"
    HTML_l += ['<table class="{}">'.format(css_tbl_cls)]


    html_str = '<tr role="row" class="model_row">\n' \
                + '<td class="model_col_1">Model</td>\n' \
                + '<td class="model_col_2"># Good Reads</td>\n' \
                + '</tr>'
    HTML_l.append(html_str)


    for m_info in good_models_list:
        html_str = '<tr role="row" class="model_row">\n' \
                + '<td class="model_col_1">' + m_info[0].split('/')[-1] + '</td>\n' \
                + '<td class="model_col_2">' + str(m_info[1]) + '</td>\n' \
                + '</tr>'
        HTML_l.append(html_str)


    HTML_l.append('</table>\n')
    HTML_l.append("</div>\n")

    HTML_str += "\n".join(HTML_l)

    HTML_str += "</body></html>"

    return HTML_str


def main():
    
    args = sys.argv
    if args[1] == "how":
        print("python3 HTMLReport.py HTML_d.json op_fp.html")
        sys.exit(0)
    
    with open(args[1], "r") as f:
        html_d = json.loads(f.read())

    HTML_str = CreateHTMLString(html_d)

    with open(args[2], "w") as f:
        f.write(HTML_str)

    print("Wrote HTML file to " + args[2])



    return None

if __name__ == "__main__":
    main()
