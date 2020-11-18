window.BCdefaults = {
    "note": "All div sizes are based on an unknown base div which we haven't decided on yet.",
    "lyt_vls": {
        "BC_main_div": {
            "tag_type": "DIV",
            "description": "div containing the entire BarChart display",
            "id_i": {
                "parent_id": "entire-display-holder",
                "id": "bc-display-main-div",
                "class": "BC-display"
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
        "graph_explain_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "bc-display-main-div",
                "id": "graph-display-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": 1,
                "w": .6
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            }
        },
        "graph_title_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "graph-display-div",
                "id": "graph-title-div",
                "class": "BC-display"
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
                "fontSize": "20px"
            }
        },
        "Barchart_SVG_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "graph-display-div",
                "id": "barchart-svg-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0.05,
                "h": .65,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            }
        },
        
        "Explanation_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "graph-display-div",
                "id": "barchart-explain-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0.05,
                "t": 0.73,
                "h": .27,
                "w": .9
            },
            "style_i": {
                "position": "absolute",
                "overflow": "auto",
                "fontSize": "20px"
            },
            "unq_prp": {
                "innerHTML": "Click on a gene (green and red boxes) to see its function and sequence. Click on a bar rectangle (blue) to see internal distribution of transposon insertions. At the base pair level, see the barcodes and surrounding sequence. To highlight a sequence, double click on it. The '^' symbol in the 'Surrounding Sequence' box represents the location of the insertion."
            }
        },
        "Other_Info_Div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "bc-display-main-div",
                "id": "bc-info-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": .6,
                "t": 0,
                "h": 1,
                "w": .4
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            }

        },
        "Barcodes_Title_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "bc-info-div",
                "id": "barcodes-title-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": .6,
                "h": .05,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center",
                "fontWeight": "bold",
                "lineHeight": "40px",
                "alignItems": "center",
                "textDecoration": "underline",
                "fontSize": "20px"
            },
            "unq_prp": {
                "innerHTML": "Barcodes:"
            }
        },
        "Barcodes_info_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "bc-info-div",
                "id": "barcodes-info-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": .65,
                "h": .15,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            },
            "unq_prp": {
            }

        },
        "Strand_n_sequence_title_div": { 
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "barcodes-info-div",
                "id": "barcodes-info-strand-and-sequence-title",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": .2,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            },
            "unq_prp": {
            }
        },
        "Strand_n_sequence_Strand_Label_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "barcodes-info-strand-and-sequence-title",
                "id": "strand-and-sequence-title-strand-label",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": 1,
                "w": 0.3
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center"
            },
            "unq_prp": {
                "innerHTML": "Strand:"
            }
        },
        "Strand_n_sequence_Sequence_Label_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "barcodes-info-strand-and-sequence-title",
                "id": "strand-and-sequence-title-sequence-label",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0.3,
                "t": 0,
                "h": 1,
                "w": 0.7
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center"
            },
            "unq_prp": {
                "innerHTML": "Sequences:"
            }
        },
        "Strand_n_sequence_display_div": { 
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "barcodes-info-div",
                "id": "barcodes-info-strand-and-sequence-display",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": .2,
                "h": .8,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            },
            "unq_prp": {
            }
        },
        "Strand_n_sequence_Strand_Display_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "barcodes-info-strand-and-sequence-display",
                "id": "strand-and-sequence-display-strand-display",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": 1,
                "w": .3
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            },
            "unq_prp": {
            }

        },
        "Strand_n_sequence_Sequence_Display_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "barcodes-info-strand-and-sequence-display",
                "id": "strand-and-sequence-display-sequence-display",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": .3,
                "t": 0,
                "h": 1,
                "w": .7
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            },
            "unq_prp": {
            }

        },
        "Genes_title_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "bc-info-div",
                "id": "genes-title-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0.2,
                "h": .05,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center",
                "fontWeight": "bold",
                "textDecoration": "underline",
                "lineHeight": "40px",
                "alignItems": "center",
                "fontSize": "20px"

            },
            "unq_prp": {
                "innerHTML": "Genes:"
            }

        },
        "Genes_info_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "bc-info-div",
                "id": "genes-info-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": .25,
                "h": .15,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            },
            "unq_prp": {
            }
        },
        "Strand_n_description_title_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "genes-info-div",
                "id": "genes-info-strand-and-description-title",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": .2,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            },
            "unq_prp": {
            }
        },
        "Strand_n_description_strand_title": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "genes-info-strand-and-description-title",
                "id": "genes-info-strand-and-description-strand-title",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": 1,
                "w": 0.3
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center"
            },
            "unq_prp": {
                "innerHTML": "Strand:"
            }

        },
        "Strand_n_description_description_title": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "genes-info-strand-and-description-title",
                "id": "genes-info-strand-and-description-description-title",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0.3,
                "t": 0,
                "h": 1,
                "w": 0.7
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center"
            },
            "unq_prp": {
                "innerHTML": "Description:"
            }

        },
        "Strand_n_description_display_div": { 
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "genes-info-div",
                "id": "genes-info-strand-and-description-display",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": .2,
                "h": .8,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            },
            "unq_prp": {
            }
        },
        "Strand_n_description_strand_display": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "genes-info-strand-and-description-display",
                "id": "genes-info-strand-and-description-strand-display",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": 1,
                "w": 0.3
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            },
            "unq_prp": {
            }

        },
        "Strand_n_description_description_display": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "genes-info-strand-and-description-display",
                "id": "genes-info-strand-and-description-description-display",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0.3,
                "t": 0,
                "h": 1,
                "w": 0.7
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            },
            "unq_prp": {
            }

        },
        "Surrounding_seq_title_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "bc-info-div",
                "id": "surrounding-seq-title-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": .8,
                "h": .05,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center",
                "fontWeight": "bold",
                "lineHeight": "40px",
                "alignItems": "center",
                "textDecoration": "underline"
            },
            "unq_prp": {
                "innerHTML": "Surrounding Sequence:"
            }

        },
        "Surrounding_seq_display_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "bc-info-div",
                "id": "surrounding-seq-display-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": .85,
                "h": .15,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "overflow": "auto",
                "wordWrap": "break-word",
                "display": "flex",
                "alignItems": "center",
                "fontWeight": "bold",
                "fontSize": "25px"
            },
            "unq_prp": {
            }
        },
        "Gene_seq_title_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "bc-info-div",
                "id": "gene-seq-title-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": .4,
                "h": .05,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "overflow": "auto",
                "textAlign": "center",
                "fontWeight": "bold",
                "lineHeight": "40px",
                "alignItems": "center",
                "textDecoration": "underline"
            },
            "unq_prp": {
                "innerHTML": "Gene Sequence: "
            }
        },
        "Gene_seq_display_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "bc-info-div",
                "id": "gene-seq-display-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": .45,
                "h": .15,
                "w": .985
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "overflow": "auto",
                "wordWrap": "break-word",
                "display": "flex",
                "alignItems": "center",
                "fontWeight": "bold",
                "fontSize": "25px"
            },
            "unq_prp": {
            }

        },
        "Zoom_out_btn_div": {
            "tag_type": "DIV",
            "id_i": {
                "parent_id": "bc-info-div",
                "id": "zoom-out-btn-div",
                "class": "BC-display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": .2,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "fontSize": "35px",
                "fontWeight": "bold"
            },
            "unq_prp": {
                "innerHTML": "Scaffold Highlighted Sequence:"
            }

        },
        "zoom_out_btn": {
                "tag_type": "button",
                "id_i": {
                    "parent_id": "zoom-out-btn-div",
                    "id": "zoom-out-btn",
                    "class": "BC-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l" : 0,
                    "t": 0,
                    "h": 1,
                    "w": 1
                },
                "style_i": {
                    "position": "absolute",
                    "backgroundColor": "lightblue",
                    "textColor": "white",
                    "fontSize": "35px",
                    "fontWeight": "bold",
                    "cursor":"pointer"
                },
                "unq_prp": {
                    "innerHTML": "Fully Zoomed Out"
                },
                "hover_color": "#00FFFF",
            }
        
    },
    "data" : {
        "Barchart_SVG": {
            "tag_type": "SVG",
            "id_i": {
                "parent_id": "barchart-svg-div",
                "id": "barchart-svg",
                "class": "BC-display"
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
        "Barchart_SVG_Inner_Dimensions": {
            "X_axis": {
                "label_margin_frac": 0.02,
                "label_cnt_size": 0.08,
                "label_txt_start_frac": 0.33,
                "tick_label_dist_frac": 0.015,
                "label_style": {
                    "fontWeight": "bold",
                    "fontSize": 20
                },
                "ticks_labels": {
                    "container_size": 0.08,
                    "ticks_frac": 0.2,
                    "label_frac": 0.8,
                    "style": {
                    "fontWeight": "normal",
                    "fontSize": 10
                    }
                },
                "origin": [0.16, 0.84],
                "axis_len": 0.8,
                "axis_stroke_width": 0.001
            },
            "Genes_Box": {
                "bottom_left_corner": [0.16, 0.84],
                "top_right_corner": [0.96, 0.74]
            },
            "Y_axis": {
                "label_margin_frac": 0.02,
                "label_cnt_size": 0.08,
                "label_txt_start_frac": 0.33,
                "tick_label_dist_frac": 0.015,
                "label_style": {
                    "fontWeight": "bold",
                    "fontSize": 20
                },
                "ticks_labels": {
                    "container_size": 0.08,
                    "ticks_frac": 0.2,
                    "label_frac": 0.8,
                    "style": {
                        "fontWeight": "normal",
                        "fontSize": 10
                    }

                },
                "origin": [0.16, 0.74],
                "axis_len": 0.68,
                "axis_stroke_width": 0.001
            }
        },
        "Gene_Display_Info": {
            "DisplayBoxDimensions": {
                "height": .5
            },
            "strand_display_object": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "genes-info-strand-and-description-strand-display",
                    "id": "genes-info-single-strand-display",
                    "class": "BC-display"
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
                    "border": "2px solid gray",
                    "textAlign": "center",
                    "fontSize": "20px",
                    "fontWeight": "bold"
                },
                "unq_prp": {
                }
            },
            "description_display_object": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "genes-info-strand-and-description-description-display",
                    "id": "genes-info-single-description-display",
                    "class": "BC-display"
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
                    "border": "2px solid gray",
                    "overflow": "auto",
                    "textAlign": "center",
                    "fontSize": "20px"
                },
                "unq_prp": {
                }
            }
        },
        "Barcodes_Display_Info": {
            "DisplayBoxDimensions": {
                "height": .5
            },
            "strand_display_object": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "strand-and-sequence-display-strand-display",
                    "id": "barcodes-info-single-strand-display",
                    "class": "BC-display"
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
                    "border": "2px solid gray",
                    "textAlign": "center",
                    "fontSize": "20px",
                    "fontWeight": "bold"
                },
                "unq_prp": {
                }
            },
            "barcodes_display_object": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "strand-and-sequence-display-sequence-display",
                    "id": "barcodes-info-sequences-display",
                    "class": "BC-display"
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
                    "border": "2px solid gray",
                    "overflow": "auto",
                    "textAlign": "center",
                    "fontSize": "15px"
                },
                "unq_prp": {
                }
            }
        }
    }
}
