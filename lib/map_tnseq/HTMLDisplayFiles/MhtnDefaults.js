window.MhtnDefaults = {
    "lyt_vls": {
            "graph_display_div_i": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "entire-display-holder",
                    "id": "graph-display-div",
                    "class": "Mhtn-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": 0,
                    "t": 0,
                    "h": .8,
                    "w": 1
                },
                "style_i": {
                    "position": "absolute",
                    "border": "2px solid gray"
                }
            },
            "explanation_div": {
                "tag_type": "DIV",
                "id_i": {
                "parent_id": "entire-display-holder",
                "id": "expln-div",
                "class": "Mhtn-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": 0,
                    "t": .8,
                    "h": .2,
                    "w": 1
                },
                "explain_text": [
                    "Explanation: We calculate the mean by taking the total number of insertions",
                " and dividing that by the total number of locations with insertions.",
                " We compute the Standard Deviation using that mean. The Z-score for a",
                " point is (#Insertions - Mean)/SD. We do not list any values whose Z-score",
                " is below 0.",
                    ],
                "style_i": {
                    "position": "absolute",
                    "border": "2px solid gray",
                    "textAlign": "center",
                    "fontWeight": "bold",
                    "fontSize": "20px"
                }
            },
            "graph_and_title_div": {
                "tag_type": "DIV",
                "id_i": {
                "parent_id": "graph-display-div",
                "id": "grph-n-ttl-div",
                "class": "Mhtn-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": 0,
                    "t": 0,
                    "h": 1,
                    "w": .75
                },
                "style_i": {
                    "position": "absolute",
                    "border": "2px solid gray"
                }
            },

            "graph_title_div": {
                "tag_type": "DIV",
                "id_i": {
                    "class": "Mhtn-display",
                    "parent_id": "grph-n-ttl-div",
                    "id": "grph-ttl-div"
                },
                "graph_title": "Transposon Insertions Plot",
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": .15,
                    "t": 0,
                    "h": .075,
                    "w": .7
                },
                "style_i": {
                    "position": "absolute",
                    "textAlign": "center",
                    "fontWeight": "bold",
                    "fontSize": "35px"
                }
            },
            "graph_svg_div": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "grph-n-ttl-div",
                    "id": "grph-svg-div",
                    "class": "Mhtn-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": 0,
                    "t": .075,
                    "h": .925,
                    "w": 1
                },
                "style_i": {
                    "position": "absolute",
                    "border": "2px solid gray",
                    "overflow": "auto"
                }
            },
            "graph_svg" : {
                "tag_type": "SVG",
                "id_i": {
                    "parent_id": "grph-svg-div",
                    "id": "grph-svg",
                    "class": "Mhtn-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": .02,
                    "t": .02,
                    "h": .95,
                    "w": .95
                },
                "style_i": {
                    "position": "absolute",
                    "border": "2px solid gray"
                }
            },
            "graph_info_sidebar": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "graph-display-div",
                    "id": "grph-sidebar-div",
                    "class": "Mhtn-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": .75,
                    "t": 0,
                    "h": 1,
                    "w": .25
                },
                "style_i": {
                    "position": "absolute",
                    "border": "2px solid gray"
                }
            },
            "point_info_div": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "grph-sidebar-div",
                    "id": "point-info-div",
                    "class": "Mhtn-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": 0,
                    "t": 0,
                    "h": .3,
                    "w": 1
                },
                "style_i": {
                    "position": "absolute",
                    "border": "2px solid gray"
                }
            },
            "point_info_ttl_div": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "point-info-div",
                    "id": "point-info-ttl-div",
                    "class": "Mhtn-display"
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
                    "fontSize": "20px",
                    "textDecoration": "underline"
                }
            },
            "point_info_scrldwn_div": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "point-info-div",
                    "id": "point-info-scrldwn-div",
                    "class": "Mhtn-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": 0,
                    "t": .15,
                    "h": .85,
                    "w": 1
                },
                "style_i": {
                    "position": "absolute",
                    "border": "2px solid gray",
                    "overflow": "auto",
                    "textAlign": "center",
                    "fontWeight": "bold",
                    "fontSize": "20px"
                    
                }
            },
            "scfld_list_div": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "grph-sidebar-div",
                    "id": "scfld-list-div",
                    "class": "Mhtn-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": 0,
                    "t": .3,
                    "h": .6,
                    "w": 1
                },
                "style_i": {
                    "position": "absolute",
                    "border": "2px solid gray"
                }
            },
            "scfld_list_ttl_div": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "scfld-list-div",
                    "id": "scfld-list-ttl-div",
                    "class": "Mhtn-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": 0,
                    "t": 0,
                    "h": .08,
                    "w": 1
                },
                "style_i": {
                    "position": "absolute",
                    "border": "2px solid gray",
                    "textAlign": "center",
                    "fontWeight": "bold",
                    "fontSize": "20px",
                    "textDecoration": "underline"
                }
            },
            "scfld_list_scrldwn_div": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "scfld-list-div",
                    "id": "scfld-list-scrldwn-div",
                    "class": "Mhtn-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": 0,
                    "t": .08,
                    "h": .92,
                    "w": 1
                },
                "style_i": {
                    "position": "absolute",
                    "border": "2px solid gray",
                    "overflow": "auto"
                }
            },
            "scfld_list_tbl": {
                "tag_type": "TABLE",
                "id_i": {
                    "parent_id": "scfld-list-scrldwn-div",
                    "id": "scfld-list-tbl",
                    "class": "Mhtn-display"
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
                    "border": "1px solid black",
                    "height": "auto"
                }
            },
            "all_scaffolds_btn_div": {
                "tag_type": "DIV",
                "id_i": {
                    "parent_id": "grph-sidebar-div",
                    "id": "all-scaffolds-btn-div",
                    "class": "Mhtn-display"
                },
                "size_loc_i": {
                    "values_type": "fractions",
                    "l": 0,
                    "t": .9,
                    "h": .1,
                    "w": 1
                },
                "style_i": {
                    "position": "absolute",
                    "border": "2px solid gray"
                }
            },
            "all_scf_btn": {
                "tag_type": "button",
                "size_loc_i": {
                    "values_type": "fractions",
                    "l" : 0,
                    "t": 0,
                    "h": 1,
                    "w": 1
                },
                "style_i": {
                    "position": "absolute",
                    "paddingBottom": "0px",
                    "backgroundColor": "lightblue",
                    "textColor": "white"
                },
                "innerHTML": "<h3>All Scaffolds</h3>",
                "hover_color": "#00FFFF",
                "id_i": {
                    "id": "return-btn",
                    "parent_id": "all-scaffolds-btn-div",
                    "class": "Mhtn-display"
                }
            }
    },
    "Scaffold_Info_Table_Values" : {
        "entry_size_info": {
            "scf_tbl": {
                "size_loc_i": {}
            }
        },
        "color_options": ["red", "blue", "green", "orange",
                        "purple", "yellow", "pink"]
    },

    "Mhtn_Display_SVG_Values" : {

        "x_i" : {
                        "description": "x axis info",
                        "x_title_i": {
                            "size_loc_i": {
                                "values_type": "fractions",
                                "l": 0,
                                "t": .94,
                                "h": .06,
                                "w": 1
                            },
                            "label": "Scaffolds (Sorted by decreasing length)",
                            "style_i": {
                                "fontSize": 20,
                                "fontWeight": "normal"
                            }
                        },
                        "x_ticks_i": {
                            "size_loc_i": {
                                "values_type": "fractions",
                                "l": 0,
                                "t": .88,
                                "h": .06,
                                "w": 1
                            },
                            "tick_length": 0.3,
                            "distance_to_text": 0.45,
                            "width_shift": 3,
                            "style_i": {
                                "color": "black",
                                "strokeWidth": 1
                            }
                        },
                        "x_axis_i": {
                            "size_loc_i": {
                                "values_type": "fractions",
                                "l": .12,
                                "t": .88,
                                "w": .83
                            },
                            "style_i": {
                                "strokeWidth": 2,
                            }
                        }

            },
        "y_i" : {
                        "description": "y axis info",
                        "y_title_i": {
                            "description": "box containing Y axis label",
                            "size_loc_i": {
                                "values_type": "fractions",
                                "l": 0,
                                "t": 0,
                                "h": 1,
                                "w": .06
                            },
                            "label": "Z Score",
                            "style_i": {
                                "fontSize": 20,
                                "fontWeight": "normal"
                            }
                        },
                        "y_ticks_i": {
                            "description": "box containing Y ticks and labels",
                            "size_loc_i": {
                                "values_type": "fractions",
                                "l": .06,
                                "t": 0,
                                "h": 1,
                                "w": .06
                            },
                            "tick_length": 0.3,
                            "distance_to_text": 0.45,
                            "height_shift": 3,
                            "style_i": {
                                "color": "black",
                                "strokeWidth": 2,
                                "fontSize": 10,
                                "fontWeight": "normal"
                            }
                        },
                        "y_axis_i": {
                            "size_loc_i": {
                                "values_type": "fractions",
                                "l": .12,
                                "t": .88,
                                "h": .85
                            },
                            "style_i": {
                                "strokeWidth": 2
                            }
                        }
        },
        "org": [.12, .88],
        "GraphValues": {
            "max_circle_frac": 0.01,
            "min_circle_frac": 0.002
        }
    }
}

