window.StatsDefaults = {
    "lyt_vls": {
        "full_display_div": {
            "tag_type": "DIV",
            "notes": ["div containing all sub divs"],
            "id_i": {
                "parent_id": "entire-display-holder",
                "id": "stats-display-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": 1,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            }
        },
        "genome_title_div": {
            "tag_type": "DIV",
            "notes": ["div containing genome name"],
            "id_i": {
                "parent_id": "stats-display-div",
                "id": "stats-genome-title-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": .05,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center",
                "fontWeight": "bold",
                "alignItems": "center",
                "lineHeight": "40px",
                "fontSize": "32px"
            }
        },
        "model_info_div": {
            "tag_type": "DIV",
            "notes": ["div containing model info"],
            "id_i": {
                "parent_id": "stats-display-div",
                "id": "model-info-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0.05,
                "h": .15,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"

            }
        },
        "model_name_title_div": {
            "tag_type": "DIV",
            "notes": ["div containing model info"],
            "id_i": {
                "parent_id": "model-info-div",
                "id": "model-name-title-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": .3,
                "w": .3
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center",
                "fontWeight": "bold",
                "alignItems": "center",
                "lineHeight": "40px",
                "fontSize": "30px"
            },
            "unq_prp": {
                "innerHTML": "Model Name:"
            }
        },
        "model_name_content_div": {
            "tag_type": "DIV",
            "notes": ["div containing model info"],
            "id_i": {
                "parent_id": "model-info-div",
                "id": "model-name-content-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0.3,
                "h": .7,
                "w": .3
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "fontSize": "20px",
                "textAlign": "center",
                "alignItems": "center",
                "lineHeight": "40px",
                "wordWrap": "break-word"
            }
        },
        "model_sequence_title_div": {
            "tag_type": "DIV",
            "notes": ["div containing model info"],
            "id_i": {
                "parent_id": "model-info-div",
                "id": "model-sequence-title-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0.3,
                "t": 0,
                "h": .3,
                "w": .7
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center",
                "fontWeight": "bold",
                "alignItems": "center",
                "lineHeight": "40px",
                "fontSize": "30px"

            },
            "unq_prp": {
                "innerHTML": "Model Sequence:"
            }
        },
        "model_sequence_content_div": {
            "tag_type": "DIV",
            "notes": ["div containing model info"],
            "id_i": {
                "parent_id": "model-info-div",
                "id": "model-sequence-content-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0.3,
                "t": 0.3,
                "h": .7,
                "w": .7
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "fontSize": "18px",
                "overflow":"auto",
                "wordWrap": "break-word"
            }
        },
        "fastq_reads_info_div": {
            "tag_type": "DIV",
            "notes": ["div containing info from FASTQ reads"],
            "id_i": {
                "parent_id": "stats-display-div",
                "id": "fastq-reads-info-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0.23,
                "h": .4,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            }
        },
        "fastq_reads_title_div": {
            "tag_type": "DIV",
            "notes": ["div containing info from FASTQ reads"],
            "id_i": {
                "parent_id": "fastq-reads-info-div",
                "id": "fastq-reads-title-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": .12,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center",
                "fontWeight": "bold",
                "alignItems": "center",
                "lineHeight": "40px",
                "fontSize": "35px"

            },
            "unq_prp": {
                "innerHTML": "FASTQ Reads Report:"
            }
        },
        "fastq_reads_table_div": {
            "tag_type": "DIV",
            "notes": ["div containing info from FASTQ reads"],
            "id_i": {
                "parent_id": "fastq-reads-info-div",
                "id": "fastq-reads-table-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0.12,
                "h": .88,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "overflow": "auto"
            }
        },
        "pool_report_info_div": {
            "tag_type": "DIV",
            "notes": ["div containing info regarding entire mutant pool"],
            "id_i": {
                "parent_id": "stats-display-div",
                "id": "mutant-pool-info-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0.7,
                "h": .3,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            }
        },
        "pool_report_title_div": {
            "tag_type": "DIV",
            "notes": ["div containing info regarding entire mutant pool"],
            "id_i": {
                "parent_id": "mutant-pool-info-div",
                "id": "mutant-pool-title-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": .15,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center",
                "fontWeight": "bold",
                "alignItems": "center",
                "lineHeight": "40px",
                "fontSize": "35px"

            },
            "unq_prp": {
                "innerHTML": "Mutant Pool Report:"
            }
        },
        "pool_report_table_div": {
            "tag_type": "DIV",
            "notes": ["div containing table with mutant pool stats"],
            "id_i": {
                "parent_id": "mutant-pool-info-div",
                "id": "mutant-pool-table-div",
                "class": "stats-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0.15,
                "h": 0.85,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "overflow": "auto"
            }
        }
    },
    "text_display": {
        "table_style": {
            "width": "100%"
        },
        "row_styles": {
            "title_cell": {
                "border": "2px solid black",
                "fontWeight": "bold",
                "fontSize": "26px",
                "textAlign": "center",
                "height": "40px",
                "width": "100%"
            },
            "basic_row": {
                "border": "1px solid black",
                "fontWeight": "normal",
                "fontSize": "24px",
                "textAlign": "center",
                "height": "25px",
                "width": "50%"
            }
        }
    }
}
