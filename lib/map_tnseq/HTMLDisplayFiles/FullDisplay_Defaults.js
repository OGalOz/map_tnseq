window.FD_Defaults = {
    "lyt_vls": {
        "full_display_div": {
            "tag_type": "DIV",
            "notes": ["div containing both the navigation bar and the viz display"],
            "id_i": {
                "parent_id": "body",
                "id": "full-display-body",
                "class": "Full-Display"
            },
            "size_loc_i": {
                "values_type": "fixed",
                "l": 10,
                "t": 10,
                "h": 1000,
                "w": 1200
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            }
        },
        "navigation_div": {
            "tag_type": "DIV",
            "notes": ["div containing the buttons used to navigate between displays"],
            "id_i": {
                "parent_id": "full-display-body",
                "id": "full-navigation-menu",
                "class": "Full-Display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": 1.0,
                "w": .15
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            }
        },
        "statistics_button": {
            "tag_type": "DIV",
            "notes": ["div of button used to move into Stats Display"],
            "id_i": {
                "parent_id": "full-navigation-menu",
                "id": "full-stats-btn",
                "class": "Full-Display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0,
                "h": .1,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center",
                "fontWeight": "bold",
                "backgroundColor": "#f7bbbb",
                "lineHeight": "80px",
                "cursor": "pointer",
                "alignItems": "center",
                "textDecoration": "underline",
                "fontSize": "20px"
            },
            "unq_prp": {
                "innerHTML": "Statistics Display"
            }
        },
        "mhtn_button": {
            "tag_type": "DIV",
            "notes": ["div of button used to move into Manhattan Plot Display"],
            "id_i": {
                "parent_id": "full-navigation-menu",
                "id": "full-mhtn-plot-btn",
                "class": "Full-Display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": .1,
                "h": .1,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "textAlign": "center",
                "backgroundColor": "#E0FFFF",
                "fontWeight": "bold",
                "lineHeight": "80px",
                "alignItems": "center",
                "cursor": "pointer",
                "textDecoration": "underline",
                "fontSize": "20px"
            },
            "unq_prp": {
                "innerHTML": "Manhattan Plot Display"
            }
        },
        "EBC_scflds_btns_div": {
            "tag_type": "DIV",
            "notes": ["div of button used to move into individual Expanded Bar Chart Scaffolds Display"],
            "id_i": {
                "parent_id": "full-navigation-menu",
                "id": "full-EBC-scfld-btns-div",
                "class": "Full-Display"
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
                "border": "2px solid gray",
                "backgroundColor": "#d3f8d3",
                "overflow": "auto"
            }
        },

        "EBC_scflds_title": {
            "tag_type": "DIV",
            "notes": ["Title div for the Expanding Bar Chart scaffolds"],
            "id_i": {
                "parent_id": "full-EBC-scfld-btns-div",
                "id": "full-EBC-scfld-btns-title-div",
                "class": "Full-Display"
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
                "lineHeight": "40px",
                "alignItems": "center",
                "fontSize": "15px"
            },
            "unq_prp": {
                "innerHTML": "Bar Charts:"
            }
        },

        "EBC_scflds_btns_holder_div": {
            "tag_type": "DIV",
            "notes": ["Buttons div for the Expanding Bar Chart scaffolds"],
            "id_i": {
                "parent_id": "full-EBC-scfld-btns-div",
                "id": "full-EBC-scfld-btns-holder-div",
                "class": "Full-Display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": 0,
                "t": 0.08,
                "h": 0.92,
                "w": 1
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray",
                "overflow": "auto"
            },
            "unq_prp": {
            }
        },
        "EBC_scflds_btns_table": {
            "tag_type": "TABLE",
            "notes": ["TABLE with links for the Expanding Bar Chart scaffolds"],
            "id_i": {
                "parent_id": "full-EBC-scfld-btns-holder-div",
                "id": "full-EBC-scfld-btns-holder-tbl",
                "class": "Full-Display"
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
            },
            "unq_prp": {
            }
        },


        "main_viz_div": {
            "tag_type": "DIV",
            "notes": ["div containing the entire BarChart display"],
            "id_i": {
                "parent_id": "full-display-body",
                "id": "entire-display-holder",
                "class": "Full-Display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "l": .15,
                "t": 0,
                "h": 1,
                "w": .85
            },
            "style_i": {
                "position": "absolute",
                "border": "2px solid gray"
            }

        }
    },
    "variable_layout_data": {
        "EBC_scf_row_info": {
            "tag_type": "A",
            "notes": ["divs with buttons to individual scaffolds"],
            "id_i": {
                "parent_id": "full-EBC-scfld-btns-holder-div",
                "id_base": "EBC-scfld-single-btn-",
                "class": "Full-Display"
            },
            "size_loc_i": {
                "values_type": "fractions",
                "h": .08,
                "w": 1
            },
            "style_i": {
                "border": "2px solid gray",
                "textAlign": "center",
                "lineHeight": "20px",
                "alignItems": "center",
                "textDecoration": "underline",
                "fontSize": "16px"
            },
            "unq_prp": {}

        }
    }
}
