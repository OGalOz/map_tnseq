MhtnDefaults = {

    "scale_val": 1.0,

    "x_i" : {
                    "description": "x axis info",
                    "x_label": "Scaffolds (Sorted by decreasing length)", 
                    "x_label_font_size": 20,
                    "x_label_color": "black",
                    "x_label_dst": 40, 
                    "x_axis_color": "black",
                    "x_axis_percent_len": 85.0,
                    "x_axis_stroke_width": 2,
                    "x_tick_len":  5, 
                    "x_tick_stroke_width": 2, 
                    "x_ticks_font_size": 10,
                    "x_tick_color": "black"

        },
    "y_i" : {
                    "description": "y axis info",
                    "y_label": "Z Score", 
                    "y_label_font_size": 20,
                    "y_label_color": "black",
                    "y_label_dst": 30, 
                    "y_axis_color": "black",
                    "y_axis_percent_len": 60,
                    "y_axis_stroke_width": 2,
                    "y_tick_len":  5, 
                    "y_tick_stroke_width": 2, 
                    "y_ticks_font_size": 10,
                    "y_tick_color": "black"

    },
   
    "SVG_graph_info": {
        "margin": {top: 40, right: 40, bottom: 20, left: 120},

        "svg_dimensions" : {"width": 1000, "height": 700, "left": 50,
                        "right": 50, "top": 50, "bottom": 50},

        "origin": {
            "x": 120,
            "y": 580
        }
    },


    "Position_Div_Info": {
        "top": "10px",
        "left": "10px",
        "width": "400px",
        "position": "fixed",
        "div_id": "pos-info-div",
        "h_i": {
            "tag_type": "H3",
            "top": "10px",
            "left": "10px",
            "h_id": "MH-point-info",
            "base_text": "Click on a point for info: "
        }

    },

   "Return_Btn_Info": {
        
        "top": "10px",
        "left": "800px",
       "height": "50px",
        "width": "100px",
        "position": "fixed",
        "btn_id": "return-btn",
       "bg_color": "lightblue",
       "inner_text": "All Scaffolds",
       "paddingBottom": "75px",
       "text_color": "white" 

   },

    "Info_Table": {
        "Table_Title_Info": {

            "tag_type": "H2",
            "top": "50px",
            "left": "1050px",
            "position": "fixed",
            "id": "table-title",
            "text": "Scaffolds"

        },
        "Table_Div_Info": {

        "top": "100px",
        "left": "1050px",
       "height": "500px",
        "width": "300px",
        "position": "fixed",
            "id": "scf-tbl-div"
        }




    }



}
