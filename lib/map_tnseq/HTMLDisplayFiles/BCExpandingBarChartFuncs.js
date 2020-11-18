/*
 *
 * Expanding Bar Chart which shows insertions in a scaffold in Javascript on a browser.
 *
 * Written by Omree Gal-Oz at the Arkin Lab, part of the Lawrence Berkeley Lab,
 *  funded by the DOE.
 *
 *
 */


/*


        To Do:
            Prepare smaller sized bar_data functions 
            Add await to internal javascript calculations that freeze the browser?
            Provide description functions when you click on a gene
             
                We have a single primary Expanding Bar Chart (EBC) Object. 
                It contains 7 parts:
                    1. loc_to_bar_data: (d)
                           Note: Below start_val and end_val are integers representing start of bar chart display
                               and end of bar chart display.
                           str(start_val) + "-" + str(end_val) -> list<tick_info_l>
                               tick_info_l: list<start_int, num_insertions>
                                   start_int: (int) Starting bp value of tick
                                   num_insertions: (int) Number of insertions between this tick and the next/end
                    2. pos_to_insertion_num_and_barcodes_d: (d)
                            str(int) -> pos_obj
                                pos_obj (object)
                                    nIns: Num,
                                    str(+/-) -> list<barcode>
                                    barcode (str) a list of 20 nucleotides "A","C","T","G"
                    3. gene_ids_to_desc_and_layers_d: (d)
                        gene_id (str) -> list<gene_desc (d), layer_num (int)>
                    4. gene_loc_list: (d)
                        list<gene_loc_info_list>
                            gene_loc_info_list: list<start_bp (int), end_bp (int), gene_id (str), strand (str) >
                            Where start_bp and end_bp are locations of start and end of gene within 
                                the scaffold
                    5. scaffold_length (integer)
                    6. tick_range_threshold (int) The lowest int for which the sub tick values are calculated in
                        loc_to_bar_data.
                    7. scaffold_sequence (str) The sequence of the scaffold

                    


                We need three primary global data objects: 
                    data_viz_d (BCdata_viz.js) Biggest (Variable)
                        This contains the data used to take info when you get down
                            to the single nucleotide
                        It is an object that pertains to a single scaffold.
                        The object has the following properties:
                        num_bp: Num,
                        scaffold_name: str
                        positions: Object


                        scf_ticks_data_d (BC_info.js) Second Biggest (Variable)
                            This contains the specific data needed to draw the bars
                            two keys:
                                scaffold_length: (i) Length of entire scaffold
                                
                    BCdefaults (BCDefaults.js): (Non Variable)
                        This never changes. Used to draw and create the shell of the display.

        OLD To Do:
            Create back up button. Link through ZoomOutView function.


        Initiate original SVG
         Add functions to every rectangle which reset the SVG with new data set
         Create multiple data sets with python that can be used by this javascript
         List all necessary inputs from data object
         Create bar clicking visual (CSS)
         Create return to original state button

        Args:
         bar_data is a list of lists with format:
              [[insertion_right_bp (int), number_of_insertions (int)], ... ] 

*/


//FUNCTIONS


function CreateInitialBCDisplay(BCdefaults, EBC_object, scf_name, organism_name) {
 /*
  * Args:
  *     BCdefaults: (d)
  *     EBC_object: (d) contains
  *         loc_to_bar_data
  *         pos_to_insertion_num_and_barcodes_d
  *         gene_loc_list
  *         gene_ids_to_desc_and_layers_d
  *     scf_name: (str)
  * 
  *
  */
    let loc_to_bar_data = EBC_object["loc_to_bar_data"];
    let pos_to_insertion_num_and_barcodes_d = EBC_object["pos_to_insertion_num_and_barcodes_d"];
    let scf_length = EBC_object["scaffold_length"];


        // We create all the boxes in FP manner
    CreateBarChartDisplaySkeleton(BCdefaults, scf_name, organism_name);
    CreateAndPopulateBarChartDisplaySVG(BCdefaults, scf_length, EBC_object);


}



function CreateBarChartDisplaySkeleton(BCdefaults, scf_name, organism_name) {
    /*
     *  This function takes the data in BCDefaults.js "lyt_vls" and for each of the data objects
     *      there, creates a DOM object with the properties given in the data.
     *  It essentially creates all the elements necessary for the visualization except for 
     *      the two SVGs, which will be created using the d3 library.
     *
     * BCdefaults: (object)
     *  lyt_vls: dict containing names -> dobjs we will create. (dobj - Document Object Model Object)
     *      
     *
     */
    let skeleton_div_info_dict = BCdefaults["lyt_vls"];
    let dobj_names_l = Object.keys(skeleton_div_info_dict);
    //dix - document object model object name index
    for (let dix = 0; dix < dobj_names_l.length; dix++) {
        let dobj_info_d = skeleton_div_info_dict[dobj_names_l[dix]];
        LUCreateElementFromInfo(dobj_info_d)
    }

    // We add the organism's name to the title
    document.getElementById("graph-title-div").innerHTML = organism_name + " " + scf_name;

    
}

function CreateAndPopulateBarChartDisplaySVG(BCdefaults, scf_length, EBC_object) {
    /*
     * In this function we create the SVG with the Bar Chart,
     *  and we draw the graph on the SVG using the data from
     *
     */
       
    let svg_d3_info_l = CreateBarChartSVG(BCdefaults);
    let svg_d3 = svg_d3_info_l[0];
    let svg_div_id = svg_d3_info_l[1];

    let back_up_list = ["0-" + scf_length.toString()];

    let graph_size_info_d = GetGraphSizeInfo(svg_div_id, BCdefaults["data"]["Barchart_SVG_Inner_Dimensions"]);

    // We get the input data from ticks_data["start_data"] to form the first SVG 
    let first_inp_data = GetSVGInputData(0, 
                                        scf_length, 
                                        EBC_object["loc_to_bar_data"]);


    // We update the ZoomOut Button to have the right function
    let zm_out_btn_dobj = document.getElementById("zoom-out-btn")

    // DEBUG: below will fail due to scf_ticks_data_d
    zm_out_btn_dobj.onclick = function () {
        ZoomOutView(back_up_list, svg_d3, graph_size_info_d, scf_length, EBC_object);
    };

    ResetSVG(first_inp_data, svg_d3, graph_size_info_d, back_up_list, EBC_object);
    
}

function GetGraphSizeInfo(svg_div_id, BCSVG_dimension_info) {
 /*
  * Note that in this SVG, the X origin and the Y origin
  *     aren't in the same place, because there is a box containing
  *     info regarding genes between the two axes.
  *
  * Args:
  *     svg_div_id: (str) ID of DOM div that holds svg
  *     BCSVG_dimension_info: (Object)
  *         X_axis: 
  *             label_cnt_size: Num
                label_txt_start_frac: 0.33,
  *             origin: list<Num, Num>
  *             axis_len: Num
  *             ticks_labels:
  *                 container_size: Num
  *                 ticks_frac: Num
  *                 label_frac: Num
  *         Genes_Box:
  *             bottom_left_corner: list<Num, Num>
  *             top_right_corner: list<Num, Num> 
  *         Y_axis:
  *             label_cnt_size: Num
  *             label_txt_start_frac: 0.33,
  *             origin: list<Num, Num>
  *             axis_len: Num
  *             ticks_labels:
  *                 container_size: Num
  *                 ticks_frac: Num
  *                 label_frac: Num
  *
  *     Returns: 
  *       graph_size_info_d: (obj)
  *         x_origin (left side of X-axis): list<Num,Num>
  *         x_axis_length: Num
  *         y_origin (bottom part of Y-axis): list<Num,Num>
  *         y_axis_length: Num
  *         X_label_loc: list<Num, Num> 
  *         Y_label_loc: list<Num, Num>
  *         x_tick_length: Num 
  *         y_tick_length: Num
  *         gene_box_blc: list<Num,Num> (bottom left corner)
  *         gene_box_trc: list<Num,Num> (top right corner)
  *         x_axis_stroke_width: Num
  *         y_axis_stroke_width: Num
  *         x_label_style: obj
  *             fontWeight: str
  *             fontSize: str
  *         x_tick_label_style: obj
  *             fontWeight: str
  *             fontSize: str
  *         y_label_style: obj
  *             fontWeight: str
  *             fontSize: str
  *         y_tick_label_style: obj
  *             fontWeight: str
  *             fontSize: str
  */
    if (BCSVG_dimension_info===undefined) {
        throw "BCSVG_dimension_info not passed into function GetGraphSizeInfo"
    }

    // this is graph_size_info_d
    let Graph_Size_Info = {};

    let svg_div_dobj = document.getElementById(svg_div_id);
    let svg_width = svg_div_dobj.clientWidth;
    let svg_height = svg_div_dobj.clientHeight;

    let x_origin = [BCSVG_dimension_info["X_axis"]["origin"][0]*svg_width, 
                BCSVG_dimension_info["X_axis"]["origin"][1]*svg_height];
    Graph_Size_Info["x_origin"] = x_origin; 

    let x_axis_length = svg_width * BCSVG_dimension_info["X_axis"]["axis_len"];
    Graph_Size_Info["x_axis_length"] = x_axis_length; 

    let X_label_box_height = svg_height* BCSVG_dimension_info["X_axis"]["label_cnt_size"];
    Graph_Size_Info["X_label_box_height"] = X_label_box_height; 

    let X_ticks_and_label_box_height = svg_height*
        BCSVG_dimension_info["X_axis"]["ticks_labels"]["container_size"];
    Graph_Size_Info["X_ticks_and_label_box_height"] = X_ticks_and_label_box_height;

    let X_label_loc = [x_origin[0] + 
                        x_axis_length* BCSVG_dimension_info["X_axis"]["label_txt_start_frac"],
                        svg_height*(1 - BCSVG_dimension_info["X_axis"]["label_margin_frac"]) 
                            - 0.1*(X_label_box_height)]
    Graph_Size_Info["X_label_loc"] = X_label_loc;

    Graph_Size_Info["x_tick_length"] = X_ticks_and_label_box_height* 
                        BCSVG_dimension_info["X_axis"]["ticks_labels"]["ticks_frac"];

    

    Graph_Size_Info["y_origin"] = [BCSVG_dimension_info["Y_axis"]["origin"][0]*svg_width, 
                BCSVG_dimension_info["Y_axis"]["origin"][1]*svg_height];
    Graph_Size_Info["y_axis_length"] = svg_height * BCSVG_dimension_info["Y_axis"]["axis_len"];
    

    Graph_Size_Info["Y_label_box_width"] = svg_width* BCSVG_dimension_info["Y_axis"]["label_cnt_size"];
    Graph_Size_Info["Y_ticks_and_label_box_width"] = svg_width*
        BCSVG_dimension_info["Y_axis"]["ticks_labels"]["container_size"];

    Graph_Size_Info["Y_label_loc"] =  [ 0.1*(Graph_Size_Info["Y_label_box_width"])
                        + svg_width*(BCSVG_dimension_info["Y_axis"]["label_margin_frac"]),
                        Graph_Size_Info["y_origin"][1] -
                        Graph_Size_Info["y_axis_length"]* BCSVG_dimension_info["Y_axis"]["label_txt_start_frac"]]

    Graph_Size_Info["y_tick_length"] = Graph_Size_Info["Y_ticks_and_label_box_width"]* 
                        BCSVG_dimension_info["Y_axis"]["ticks_labels"]["ticks_frac"];

    Graph_Size_Info["gene_box_blc"] = [BCSVG_dimension_info["Genes_Box"]["bottom_left_corner"][0]*svg_width,
                            BCSVG_dimension_info["Genes_Box"]["bottom_left_corner"][1]*svg_height]; 

    Graph_Size_Info["gene_box_trc"] = [BCSVG_dimension_info["Genes_Box"]["top_right_corner"][0]*svg_width,
                            BCSVG_dimension_info["Genes_Box"]["top_right_corner"][1]*svg_height];

    Graph_Size_Info["x_axis_stroke_width"] = BCSVG_dimension_info["X_axis"][
                                             "axis_stroke_width"]*svg_height;

    Graph_Size_Info["y_axis_stroke_width"] = BCSVG_dimension_info["Y_axis"][
                                             "axis_stroke_width"]*svg_width;

    Graph_Size_Info["x_label_style"] = BCSVG_dimension_info["X_axis"]["label_style"]
    Graph_Size_Info["x_tick_label_style"] = BCSVG_dimension_info["X_axis"]["ticks_labels"][
                                                        "style"]
    Graph_Size_Info["y_label_style"] = BCSVG_dimension_info["Y_axis"]["label_style"]
    Graph_Size_Info["y_tick_label_style"] = BCSVG_dimension_info["Y_axis"]["ticks_labels"][
                                                        "style"]
    Graph_Size_Info["x_tick_label_text_dist"] = BCSVG_dimension_info["X_axis"]["tick_label_dist_frac"]*svg_width;
    Graph_Size_Info["y_tick_label_text_dist"] = BCSVG_dimension_info["Y_axis"]["tick_label_dist_frac"]*svg_height;
    
    return Graph_Size_Info

}

function GetSVGInputData(start_value, end_value, scf_loc_to_bar_d) {
    /* 
     * Args:
    *   start_value & end_value are both Nums
    *   scf_loc_to_bar_d: (d)
    *       str<start_value-end_value> -> list<single_tick_data>
    *           single_tick_data: list<start bp, num insertions>
     * 
     * This function takes the information from the data_list
     *
     * data_list: list<list<left_base_pair (Num), number of insertions between this and next number (Num)>>
     *
     *
     * Returns:
     *
        BC_SVG_inp_data: (d) 
            min_x: (int) (same as first index of first value of bar_data)
            max_x: (int) (same as last tick in x-axis)
            max_y: (int)
            bar_data is a list of lists with format:
                 [[insertion_left_bp, number_of_insertions (int)], ... ] 
     */

    BC_SVG_inp_data = {
        "min_x": start_value,
        "max_x": end_value,
    }
    
    // Getting bar_data (list) from scf_loc_to_bar_d
    bar_data_key = start_value.toString() + "-" + end_value.toString();
    let bar_data = [];
    if (bar_data_key in scf_loc_to_bar_d) {
        bar_data = scf_loc_to_bar_d[bar_data_key];
    } else {
        throw "bar data not found for key " + bar_data_key + " in scf_loc_to_bar_d";
    }

    // Getting max_y
    let max_y = 0;
    for (let j = 0; j < bar_data.length; j++) {
        if (bar_data[j][1] > max_y) {
            max_y = bar_data[j][1];
        }
    }

    BC_SVG_inp_data["bar_data"] = bar_data;
    BC_SVG_inp_data["max_y"] = max_y;

    return BC_SVG_inp_data;

}

function CreateBarChartSVG(BCdefaults) {
    let barchart_svg_div_id = BCdefaults["lyt_vls"]["Barchart_SVG_div"]["id_i"]["id"];
    let barchart_svg_info_obj = BCdefaults["data"]["Barchart_SVG"];
    let svg_d3 = d3.select("#" + barchart_svg_div_id).append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("id",barchart_svg_info_obj["id_i"]["id"])
            .append("g");
    return [svg_d3, barchart_svg_div_id]
    
}

function ResetSVG(BC_SVG_inp_data, svg_d3, graph_size_info_d, back_up_list, EBC_object) {
     /* 
        BC_SVG_inp_data: (d) must have the following keys:
            min_x: (int) (same as first index of first value of bar_data)
            max_x: (int) 
            max_y: (int)
            bar_data: is a list of lists with format:
                 [[insertion_left_bp, number_of_insertions (int)], ... ] 

        svg_d3: (SVG d3 object)
        graph_size_info_d: (object) Listed in func CreateAxes
        back_up_list: ?
        EBC_object: (d) 


    */

    console.log("Resetting svg");
    console.log(BC_SVG_inp_data);

    // Clear old SVG
    svg_d3.selectAll("*").remove()

    // Prepare tick locations for x and y axis
    let x_tick_values = []
    for (var i = 0; i < BC_SVG_inp_data["bar_data"].length; i++) {
        x_tick_values.push(BC_SVG_inp_data["bar_data"][i][0])
    }
    x_tick_values.push(BC_SVG_inp_data["max_x"])

    let y_tick_values = GetProperTicks(0, BC_SVG_inp_data["max_y"]);

    CreateAxes(svg_d3, x_tick_values, y_tick_values, 
                "Bp", "Num Insertions", graph_size_info_d);
    
    SetBarRectData(svg_d3, 
            BC_SVG_inp_data["bar_data"], 
            BC_SVG_inp_data["max_y"], 
            BC_SVG_inp_data["max_x"],
            graph_size_info_d,
            back_up_list,
            EBC_object
            );


    SetGenesDisplay(svg_d3, graph_size_info_d, 
                 BC_SVG_inp_data["min_x"],
                BC_SVG_inp_data["max_x"],
                EBC_object);

}


function SetGenesDisplay(svg_d3, graph_size_info_d, start_bp, end_bp, 
                            EBC_object) {
    /*
     *
     * start_bp, end_bp: (int)
     * scf_name: (str)
     *
     *
     */
    let active_genes_l = GetActiveGenes(start_bp, end_bp, EBC_object["gene_loc_list"]);
    let geneDrawInfoList =  GetGeneDrawDict(start_bp, 
                                                end_bp, 
                                                active_genes_l, 
                                                EBC_object["gene_ids_to_desc_and_layers_d"]
                                                )
    // We unpack results from GetGeneDrawDict
    let maxLayerNum = geneDrawInfoList[0];
    let gene_draw_l = geneDrawInfoList[1];
    let minLayerNum = geneDrawInfoList[2];
    DrawActiveGenes(svg_d3, graph_size_info_d, gene_draw_l, maxLayerNum, EBC_object, end_bp - start_bp, minLayerNum);

    

}




function GetGeneDrawDict(start_bp, end_bp, active_genes_l, sub_gtl_d) {
 /*  
  *  
  * For the active genes we use the following global constant variables:
  *     
  * Args:
  *     start_bp: int
  *     end_bp: int
  *     active_genes_l: list<[start (int), end (int), gene_id (str), strand ("+"/"-")]>
  *     sub_gtl_d: (d)
  *         gene_id -> list<desc, layer (int)>
  *
  * Returns:
  *     list<maxlayerNum (int), gene_draw_d, minlayerNum (int)>
  *         gene_draw_l: list<gene_draw_info>
  *             gene_draw_info: [start_frac (Num), end_frac (Num), layer (int), strand (str), gene_id]
  */

    // The following set holds the different layers, we compute max layer from this.
    let layerSet = new Set();
    let gene_draw_l = [];
    // NOTE WE ASSUME THIS IS NEVER ZERO (?)
    let segment_length = end_bp - start_bp;

    // We iterate through the active genes, computing percentage and getting the layer
    for (let i = 0; i < active_genes_l.length; i++) {
        let current_gene_layer = sub_gtl_d[active_genes_l[i][2]][1]
        layerSet.add(current_gene_layer)

        // we get the fracs
        let start_frac = (active_genes_l[i][0] - start_bp)/segment_length;
        let end_frac = (active_genes_l[i][1] - start_bp)/segment_length;
        if (start_frac < 0) {
            start_frac = 0
        }
        if (end_frac > 1) {
            end_frac = 1
        }
        gene_draw_l.push([start_frac, 
                                            end_frac, 
                                            current_gene_layer,
                                            active_genes_l[i][3],
                                            active_genes_l[i][2]]);

    }

    // We get the maximum value from the layerSet
    let layerList = Array.from(layerSet);
    let maxlayerNum = Math.max( ...layerList );
    let minlayerNum = Math.min( ...layerList );

    return [maxlayerNum, gene_draw_l, minlayerNum]


}

function DrawActiveGenes(svg_d3, graph_size_info_d, gene_draw_l, LayerNum, EBC_object, start_bp, minlayerNum) {
 /* 
  * Args:
  *     svg_d3: The d3 svg object
  *     graph_size_info_d: (Described in function CreateAxes)
  *     gene_draw_l: list<gene_draw_info>
  *         gene_draw_info: [start_frac (Num), end_frac (Num), layer (int), strand (str), gene_id (str)]
  *     LayerNum: (Num) (int) Total number of layers in the current display of genes.
  *
  *     minlayerNum: (int) the lowest layer, so we can remove unnecessary gaps beneath the minimum layer if it isn't 1
  *
  */
    console.log("MIN LNUM");
    console.log(minlayerNum);
        
    let gene_box_width = graph_size_info_d["gene_box_trc"][0] - 
                            graph_size_info_d["gene_box_blc"][0];
    let gene_box_height = graph_size_info_d["gene_box_blc"][1] - 
                            graph_size_info_d["gene_box_trc"][1];
    let layerOffset = minlayerNum - 1;
    let layerHeight = gene_box_height/(LayerNum - layerOffset);


    svg_d3.selectAll(".gene-bar")
              .data(gene_draw_l)
              .enter()
              .append("g")
              .append("rect")
              .attr("class", "gene-bar")
              .attr("x", function(d, i) { 
                    return graph_size_info_d["gene_box_blc"][0] + 
                        d[0]*gene_box_width;})
              .attr("width", function(d) {
                  return (d[1] - d[0])*gene_box_width;
              })
              .attr("y", function(d) { 
                  return graph_size_info_d["gene_box_blc"][1] - (d[2] - layerOffset)*layerHeight;
                     })
              .attr("height", layerHeight)
              .attr("fill", function(d) {
                  if (d[3] === "+") {
                      return "green";
                  } else if (d[3] === "-" ) {
                      return "red";
                  }
              })
               .on("click", function(d, i) {
                       UpdateGeneInfoBox(d[4], d[3], EBC_object["gene_ids_to_desc_and_layers_d"][d[4]][0]);
                       UpdateGeneSequenceWindow(d[4], EBC_object)
               });
    /*
    for (let i = 0; i < gene_ids.length; i++) {
        DrawGeneBox(svg_d3, graph_size_info_d, layerHeight, gene_draw_d[gene_ids[i]])
    }
    */
}

function UpdateGeneSequenceWindow(gene_id, EBC_object) {
 /*
  *
  *scaffold_sequence
  */
    let gene_info_d = EBC_object["gene_ids_to_desc_and_layers_d"][gene_id];
    let gene_seq = EBC_object["scaffold_sequence"].slice(
            gene_info_d[0]["s"], gene_info_d[0]["e"]);

   document.getElementById("gene-seq-display-div").innerHTML = '<p style="left:8px;" >' + gene_seq + "</p>"; 
       
}

function UpdateGeneInfoBox(gene_id, strand, desc_d) {
 /*
    This function writes the gene info in the Gene Box
    gene_id & strand are strings
    desc_d: (d)
        s: (int) Starting bp
        e: (int) Ending bp
        desc: (str) Protein function description

 */
    
    CreateGeneStrandDisplay(strand);
    CreateGeneInfoDisplay(desc_d);

    console.log(desc_d["desc"]);
    //CreateGeneDescriptionDisplay(gene_id, displayDimensions);
    

}

function CreateGeneInfoDisplay(desc_d) {
 /*
  *
    desc_d: (d)
        s: (int) Starting bp
        e: (int) Ending bp
        desc: (str) Protein function description
 */

    removeAllChildNodes(document.getElementById(BCdefaults["data"][
               "Gene_Display_Info"]["description_display_object"]["id_i"]["parent_id"]));

    let description_display_obj = LUCreateElementFromInfo(BCdefaults["data"][
                            "Gene_Display_Info"]["description_display_object"]);

    description_HTML = "<p>Gene function: " + desc_d["desc"] + "</p>";
    description_HTML += "<p>Gene start: " + desc_d["s"].toString() + "</p>";
    description_HTML += "<p>Gene length: " + (desc_d["e"] - desc_d["s"]).toString() + "</p>";
    description_HTML += "<p>Gene end: " + desc_d["e"].toString() + "</p>";

    description_display_obj.innerHTML = description_HTML;

}

function CreateGeneStrandDisplay(strand) {


    removeAllChildNodes(document.getElementById(BCdefaults["data"][
               "Gene_Display_Info"]["strand_display_object"]["id_i"]["parent_id"]));

    let strand_display_obj = LUCreateElementFromInfo(BCdefaults["data"][
                            "Gene_Display_Info"]["strand_display_object"]);

    strand_display_obj.innerHTML = strand;

}

function CreateGeneDescriptionDisplay(gene_id) {

    removeAllChildNodes(document.getElementById(BCdefaults["data"][
               "Gene_Display_Info"]["description_display_object"]["id_i"]["parent_id"]));


    let desc_display_obj = LUCreateElementFromInfo(BCdefaults["data"][
                            "Gene_Display_Info"]["description_display_object"]);

    desc_display_obj.innerHTML = "Fill in " ;

}

function removeAllChildNodes(parent) {
        while (parent.firstChild) {
                    parent.removeChild(parent.firstChild);
        }
}


function DrawGeneBox(svg_d3, graph_size_info_d, layerHeight, gene_info_l) {
    /*
     * gene_info_l: [start_frac (Num), 
     *              end_frac (Num), 
     *              layer (int), 
     *              strand (str)]
     *  layerHeight: (Num) represents the size of a single layer.
     *
     *
     */



    // For each active gene, we create a rectangle from starting percentage to end perc
    // What color should the stranded genes be? (Positive Green, Negative Red)




}




function GetActiveGenes(start_bp, end_bp, gene_loc_list) {
 /* 
  * Args:
  *     start_bp, end_bp: ints
  *     scf_name: (str)
  *
  * Internal Objects:
  *     scaffold_to_gene_locs is an object in the file "BCscf_gene_locs.js"
  *     genes_info_list:  list<[start_of_gene (int), end_of_gene (int),
  *                             gene_id (str), strand (str)],
  *                         []...>
  *         
  *
  * Returns:
  *    active_genes_l: list<[start (int), end (int), scf_name (str), strand ("+"/"-")]> 
  *    
  *
  *
  */


    // active_genes contains all the genes that have overlap with the current range
    // current range starting at start_bp, ending at end_bp

    let active_genes_l = [];

    // First, we get all the active genes
    for (let ix = 0; ix < gene_loc_list.length; ix++) {
        gene_start = gene_loc_list[ix][0];
        gene_end = gene_loc_list[ix][1];
        if ( gene_start <= start_bp && gene_end >= start_bp) {
            active_genes_l.push(gene_loc_list[ix])
        } else if (gene_start >= start_bp && gene_start <= end_bp) {
            active_genes_l.push(gene_loc_list[ix])
        }
    }

    return active_genes_l

}

function UpdateSVG(start_val, end_val, svg_d3, graph_size_info_d, back_up_list, EBC_object) {
    /*
     * HERE: Fix this
     For ResetSVG, we need, BC_SVG_inp_data (min_x, max_x, max_y, bar_data)
            svg_d3,
            graph_size_info_d: (Described in function CreateAxes)

            scf_ticks_data_d (BC_info.js) Second Biggest (Variable)
                This contains the specific data needed to draw the bars
                two keys:
                    scaffold_length: (i) Length of entire scaffold
                    loc_to_bar_data: (d)
                        start_val and end_val are integers representing start of bar chart display
                            and end of bar chart display.
                        str(start_val) + "-" + str(end_val) -> list<tick_info_l>
                            tick_info_l: list<start_int, num_insertions>
                                start_int: (int) Starting bp value of tick
                                num_insertions: (int) Number of insertions between this tick and the next/end

    What is scf_ticks_data_d

    We update data for chart using data from range given in input
    start_val: (int)
    end_val: (int)
    */

    let bc_svg_inp = {
        "min_x": start_val,
        "max_x": end_val
    }

    let new_bar_data = null;


    if (end_val - start_val > EBC_object["tick_range_threshold"]) {
        // Data should exist in input scf_ticks_data_d because size too big for JS computation.

        let scaffold_data_name = start_val.toString() + "-" + end_val.toString();
        console.log(scaffold_data_name);
        new_bar_data = EBC_object["loc_to_bar_data"][scaffold_data_name];
        //console.log(scf_ticks_data_d["loc_to_bar_data"]);
        console.log("NEW BAR DATA:")
        console.log(new_bar_data);

    } else {
        // Size small enough to compute
        // Note data_viz_d is a global variable.
        new_bar_data = CreateData(start_val, end_val, EBC_object["pos_to_insertion_num_and_barcodes_d"]);
        console.log("new_bar_data:");
        console.log(new_bar_data);

    }

    let max_y = GetMaxNumInsertions(new_bar_data); 
    
    bc_svg_inp["max_y"] = max_y;
    bc_svg_inp["bar_data"] = new_bar_data;

    ResetSVG(bc_svg_inp, svg_d3, graph_size_info_d, back_up_list, EBC_object);
    

}

function GetMaxNumInsertions(bar_data) {
    
    console.log("Getting Max Number of Insertions")

    // bar_data list<list<loc_start (num), num_insertions (num)>>
    let mxn = 0;
    for (let k = 0; k< bar_data.length; k++) {
        
        if (bar_data[k][1] > mxn) {

            mxn = bar_data[k][1];
        }
        
    }
     
    return mxn
}


function CreateData(start_val, end_val, pos_to_insertion_num_and_barcodes_d) {

    /*

    Args:
        start_val: (int)
        end_val: (int)
        pos_to_insertion_num_and_barcodes_d: (d)
          position: str(int) -> 
              {"nIns": number of insertions (int),
              "+" or "-" -> list<str> each str a barcode of length 20,


    Returns:
            bar_d_l is a list of lists with format:
                 [[insertion_left_bp, number_of_insertions (int)], ... ] 
    */


    console.log("Creating Data for values " + start_val.toString() + "-" + end_val.toString());

    let tick_vals = GetProperTicks(start_val, end_val)

    console.log("tick vals: ");
    console.log(tick_vals);

    let bar_d_l = [];

    /*
    let positionsDataDDataArray = Object.entries(pos_to_insertion_num_and_barcodes_d);
    for (let i=0; i < tick_vals.length - 1; i++) {
        bar_d_l.push(GetBarData(tick_vals[i], tick_vals[i + 1], positionsDataDDataArray));
    }
    */
    for (let i=0; i < tick_vals.length - 1; i++) {
        bar_d_l.push(NewGetBarData(tick_vals[i], tick_vals[i + 1], pos_to_insertion_num_and_barcodes_d));
    }


    return bar_d_l 
}



function NewGetBarData(start_val, end_val, pos_to_insertion_num_and_barcodes_d) {
    /* 
    start_val : int starting bp location in scaffold
    end_val : int ending bp location in scaffold
    pos_to_insertion_num_and_barcodes_d: (d)
        position (str) -> {"nIns": int, etc.}

    (Sum includes end_val, does not include start_val ?)
    Returns:
        [start_val, num_insertions (int)]
    */


    let num_insert = 0;
  
    for (let ka = start_val; ka < end_val; ka++) {
        if ((ka+1).toString() in pos_to_insertion_num_and_barcodes_d) {
            //let nIns = pos_to_insertion_num_and_barcodes_d[ka.toString()]["nIns"];
            num_insert += pos_to_insertion_num_and_barcodes_d[(ka + 1).toString()]["nIns"]; 
        }
    }

    return [start_val, num_insert]
    
}

function GetBarData(startVal, endVal, positionsDataDArray) {
    /* 
    start_val : int starting bp location in scaffold
    end_val : int ending bp location in scaffold
    positionsDataDArray
        [ ["3", {"nIns":5, ...}], 
        ["7", {"nIns": 2,...}], 
        ...]

    (Sum includes end_val, does not include start_val ?)
    Returns:
        [start_val, num_insertions (int)]
    */


    let num_insert = 0;
  
    positionsDataDArray.filter((positionsDataDArrayInd, ind) => { // Ind = index
        if(positionsDataDArrayInd[0] <= endVal && positionsDataDArrayInd[0] >= startVal) {
            num_insert += positionsDataDArrayInd[1]["nIns"]
        }
    })

    // Below is Old code for this process - this breaks the browser
    /*
    // Why are we going from start_val to end_val + 1
    for (let ka = start_val; ka < end_val + 1; ka++) {
        if (positions_data_d.hasOwnProperty(ka.toString())) {
            let nIns = positions_data_d[ka.toString()]["nIns"];
            num_insert += nIns;
        }
    }
    */

    return [startVal, num_insert]
    
}

function CreateAxes(svg_d3, x_ticks, y_ticks, x_label, y_label, graph_size_info_d) {
            /*
            Here we create the axes - 
               svg_d3: the d3 svg object to which we append values
               x_ticks: list<int> The numbers in the axis 
               y_ticks: list<int> The numbers in the axis
               x_label: (str) Label for x axis
               y_label: (str) Label for y axis
  *       graph_size_info_d: (obj)
  *         x_origin (left side of X-axis): list<Num,Num>
  *         x_axis_length: Num
  *         y_origin (bottom part of Y-axis): list<Num,Num>
  *         y_axis_length: Num
  *         X_label_loc: list<Num, Num> 
  *         Y_label_loc: list<Num, Num>
  *         x_tick_length: Num 
  *         y_tick_length: Num
  *         x_tick_label_text_dist: Num
  *         y_tick_label_text_dist: Num
  *         gene_box_blc: list<Num,Num> (bottom left corner)
  *         gene_box_trc: list<Num,Num> (top right corner)
  *         x_axis_stroke_width: Num
  *         y_axis_stroke_width: Num
  *         x_label_style:
  *             fontWeight:
  *             fontSize
  *         x_tick_label_style:
  *             fontWeight:
  *             fontSize
  *         y_label_style:
  *             fontWeight:
  *             fontSize
  *         y_tick_label_style:
  *             fontWeight:
  *             fontSize
            */
            let Xmin_num = x_ticks[0];
            let Xmax_num = x_ticks[x_ticks.length - 1];
            let Xdist = Xmax_num - Xmin_num;
            let KB_bool = false;
            if (Xdist > 3000) {
                KB_bool = true;
            }
            let Ymin_num = y_ticks[0];
            let Ymax_num = y_ticks[y_ticks.length -1];
            let Ydist = Ymax_num - Ymin_num;
           


            // First we create the axes themselves
            //X Axis
            MakeLine(svg_d3, 
                        "black",
                        graph_size_info_d["x_origin"][0],
                        graph_size_info_d["x_origin"][1],
                        graph_size_info_d["x_origin"][0] + graph_size_info_d["x_axis_length"],
                        graph_size_info_d["x_origin"][1],
                        graph_size_info_d["x_axis_stroke_width"]
                    )

            /* 
            svg_obj.append('line')
                .attr('x1', graph_origin[0])
                .attr('y1', graph_origin[1])
                .attr('x2', graph_origin[0] + x_axis_length)
                .attr('y2', graph_origin[1])
                .attr('stroke', 'black')
                .attr('stroke-width', 2);
            */

            
            //Y Axis
            MakeLine(svg_d3, 
                     "black",
                     graph_size_info_d["y_origin"][0],
                     graph_size_info_d["y_origin"][1],
                     graph_size_info_d["y_origin"][0],
                     graph_size_info_d["y_origin"][1] - graph_size_info_d["y_axis_length"],
                     graph_size_info_d["y_axis_stroke_width"]
                    )

            /*
            svg_obj.append('line')
                .attr('x1', graph_origin[0])
                .attr('y1', graph_origin[1])
                .attr('x2', graph_origin[0])
                .attr('y2', graph_origin[1] - y_axis_length)
                .attr('stroke', 'black')
                .attr('stroke-width', 2);

            */

            // Labels
            // X-Axis Text Label
            // Defining label
            if (KB_bool) {
                x_label = "Location by KB";
                } else {
                x_label = "Location by base-pair";
                };
            MakeText(svg_d3, 
                    graph_size_info_d["x_label_style"]["fontWeight"], 
                    graph_size_info_d["x_label_style"]["fontSize"],
                    graph_size_info_d["X_label_loc"][0],
                    graph_size_info_d["X_label_loc"][1],
                    x_label)


            // Y-Axis Text Label

            //var rotateTranslate = d3.svg.transform().rotate(-180);
            // .attr("transform", "translate(0,0) rotate(180)")
             
            tsl = graph_size_info_d["Y_label_loc"][0].toString() + "," + 
                    graph_size_info_d["Y_label_loc"][1].toString();
            svg_d3.append('text')
                .attr("transform", "translate(" + tsl + ") rotate(270)")
                .attr('font-weight', graph_size_info_d["y_label_style"]["fontWeight"] )
                .attr('font-size', graph_size_info_d["y_label_style"]["fontSize"])
                .text(y_label);


            AddXTicksAndLabelsToAxis(svg_d3, x_ticks, graph_size_info_d, KB_bool);
            AddYTicksAndLabelsToAxis(svg_d3, y_ticks, graph_size_info_d);
            /*

            */
        
}



function AddXTicksAndLabelsToAxis(svg_d3, x_ticks, graph_size_info_d, KB_bool) {
    /*
     *
               x_ticks: list<int> The numbers in the axis 
               graph_size_info_d: Listed in function CreateAxes 
               KB_bool: (bool) boolean saying whether axes are listed in Kilobytes
                    or single nucleotides
     */

    let x_org = graph_size_info_d["x_origin"];
    let x_axis_length = graph_size_info_d["x_axis_length"];
    let Xmin_num = x_ticks[0];
    let Xdist = x_ticks[x_ticks.length - 1] - x_ticks[0];

    for (let i=0; i < x_ticks.length; i++) {
       let xtick = x_ticks[i];
       // We get X location
       let x_loc = x_org[0] + x_axis_length * ((xtick - Xmin_num)/Xdist)
       //graph_origin[0] + x_axis_length*(xtick - Xmin_num)/Xdist;
       //let x_loc = x_org[0] + x_axis_length*(i)/(x_ticks.length-1);

       //Add the tick - note stroke width is same as x-axis width
       MakeLine(svg_d3, "black", x_loc, x_org[1], x_loc, 
               x_org[1] + graph_size_info_d["x_tick_length"], 
               graph_size_info_d["x_axis_stroke_width"]);

    // Add the text - Here is where we can change it to KB instead of base pair
    let text_str = "";
    if (KB_bool) {
        text_str = (xtick/1000).toString();
        } else {
        text_str = xtick.toString();
    }

    let text_displacement = (text_str.length/2)*(graph_size_info_d["x_tick_label_style"]["fontSize"])/2;

    // We skip making label if it's second to last
    if (!(i === x_ticks.length - 2)) {
        MakeText(svg_d3, graph_size_info_d["x_tick_label_style"]["fontWeight"], 
                graph_size_info_d["x_tick_label_style"]["fontSize"],
                x_loc - text_displacement, 
                x_org[1] + graph_size_info_d["x_tick_length"] + graph_size_info_d["x_tick_label_text_dist"], 
                text_str);
        }
    }


}
function AddYTicksAndLabelsToAxis(svg_d3, y_ticks, graph_size_info_d) {
 /*         
  *
            y_ticks: list<int> The numbers in the axis
            graph_size_info_d: Listed in function CreateAxes 
  *
  */
    let y_org = graph_size_info_d["y_origin"];
    let y_axis_length = graph_size_info_d["y_axis_length"];
    let max_y = y_ticks[y_ticks.length-1];

    for (let i=0; i < y_ticks.length; i++) {
       let ytick = y_ticks[i];
       // We get y location
       // let y_loc = graph_origin[0] + y_axis_length*(ytick - ymin_num)/ydist;
       let y_loc = y_org[1] - (ytick/max_y)*y_axis_length;

       //Add the tick - note stroke width is same as y-axis width
       MakeLine(svg_d3, "black", y_org[0], y_loc,  
               y_org[0] - graph_size_info_d["y_tick_length"], 
               y_loc , 
               graph_size_info_d["y_axis_stroke_width"]);

        // Add the text - Here is where we can change it to KB instead of base pair
        let text_str = ytick.toString();

        let y_text_displacement = (graph_size_info_d["y_tick_label_style"]["fontSize"])/2;
        let x_text_displacement = (text_str.length)*((graph_size_info_d["y_tick_label_style"]["fontSize"])/2);

        // We skip making label if it's second to last
        if (!(i === y_ticks.length - 2)) {
            MakeText(svg_d3, graph_size_info_d["y_tick_label_style"]["fontWeight"], 
                graph_size_info_d["y_tick_label_style"]["fontSize"],
                y_org[0] - graph_size_info_d["y_tick_length"] - 
                        graph_size_info_d["y_tick_label_text_dist"] - x_text_displacement,
                y_loc + y_text_displacement, 
                text_str);
        }
    }



}


function MakeLine(svg_d3, color, x1, y1, x2, y2, stroke_width ) {
    /*
     * Args: 
     *  svg_d3: A d3 svg object
     *  color: str, like "black"
     *  x1 - y2, Numbers
     *  stroke_width: width of line, Number
     *
     * Note: We need to make sure the numbers are relatively close to integers
     */

               return svg_d3.append('line')
                   .attr('x1', x1.toFixed(2))
                   .attr('y1', y1.toFixed(2))
                   .attr('x2', x2.toFixed(2))
                   .attr('y2', y2.toFixed(2))
                   .attr('stroke', color)
                   .attr('stroke-width', stroke_width)
                   .attr('position', 'absolute')
                   ;

}


function MakeText(svg_obj, font_weight, font_size, x, y, text_str) {
    /*
     *  Args:
     *  
     *      svg_obj: A d3 svg object
     *      font_weight: (str) like "bold", "normal",
     *      font_size: Number
     *      x, y: Number
     *      text_str: (str) Text you want to make
     *
     */
            svg_obj.append('text')
                .attr('font-weight', font_weight)
                .attr('font-size', font_size)
                .attr('x', x)
                .attr('y', y)
                .text(text_str);

}

function SetBarRectData(svg_d3, bar_data, max_y, max_x, graph_size_info_d, back_up_list, EBC_object ) {

    /*
    In this function we create all the rectangles to be inputted

    Args:
        svg_d3: d3 SVG Object
        bar_data: a list of lists with format:
              [[insertion_left_bp (int), number_of_insertions (int)], ... ] 
              insertion_left_bp starts at 0 and ends at...
        max_y: Num
        max_x: Num
        graph_size_info_d: Object, described under func "CreateAxes"


    In this function we create all the rectangles to be inputted
    x and y are d3 ScaleLinear objects
    width and height are ints
    svg_d3 is an svg object from d3
    ***EACH BAR NEEDS TO BE ASSOCIATED WITH A FUNCTION THAT RESETS THE DATA VIEW-
    AN ONCLICK() ATTRIBUTE
    */


    //let bar_data = inp_data["bar_data"]
    let num_vals = bar_data.length;
    let init_x_val = bar_data[0][0];
    let total_dist = max_x - init_x_val;
    let x_start_loc = null;
    let single_bp = false;
    let difference = null;
    
    // We check if we're at single values
    if (bar_data.length > 1) {
        difference = bar_data[1][0] - bar_data[0][0]; 
        if (difference === 1) {
            x_start_loc = graph_size_info_d["x_origin"][0] + 
                graph_size_info_d["x_axis_length"]/(num_vals*2);
            single_bp = true;
        } else {
            x_start_loc = graph_size_info_d["x_origin"][0];
        }
    } else {
                x_start_loc = graph_size_info_d["x_origin"][0] + 
                graph_size_info_d["x_axis_length"]/(num_vals*2);
            single_bp = true;
    }


    // Here we create the empty rectangular objects
    svg_d3.selectAll(".bar")
              .data(bar_data)
              .enter()
              .append("g")
              .append("rect")
              .attr("class", "bar")
              .attr("x", function(d, i) { 
                    return x_start_loc + graph_size_info_d["x_axis_length"]*((d[0] - init_x_val)/total_dist);
                 
                    // OLD EQUAL SIZED RECTANGLES:
                    //return x_start_loc + graph_size_info_d["x_axis_length"]*i/num_vals;
              })
              .attr("width", function(d,i) {
                        if (!( i === bar_data.length - 1)) {
                            return graph_size_info_d["x_axis_length"]*(difference/total_dist);
                        } else {
                            return graph_size_info_d["x_axis_length"]*((max_x - d[0])/total_dist);
                        }
                  // OLD EQUAL SIZED RECTANGLES
                  //return graph_size_info_d["x_axis_length"]/num_vals
              })
              .attr("y", function(d) { 
                    return GetScaledValue(d[1],
                "y", 0, max_y, graph_size_info_d["x_origin"], graph_size_info_d["y_origin"],
                graph_size_info_d); } )
              .attr("height", function(d) {
                scaled_y = GetScaledValue(d[1],
                "y", 0, max_y, graph_size_info_d["x_origin"], graph_size_info_d["y_origin"],
                graph_size_info_d);
                return graph_size_info_d["y_origin"][1] - scaled_y; })
              .on("click", function(d, i) {
                    if  (!single_bp) {
                        if (!( i === bar_data.length - 1)) {
                            back_up_list.push(d[0].toString() + "-" + (d[0] + difference).toString());
                            UpdateSVG(d[0], d[0] + difference, svg_d3, graph_size_info_d, 
                                        back_up_list, EBC_object);
                        } else {
                            UpdateSVG(d[0], max_x, svg_d3, graph_size_info_d, back_up_list, EBC_object);
                            back_up_list.push(d[0].toString() + "-" + max_x.toString())
                        }
                    } else {
                        // Change color to be highlighted?
                        d3.select(this).attr("style", "fill: yellow;")
                        UpdateBarcodeInfoForPosition(d[0] + 1, EBC_object);
                        UpdateSurroundingSequence(d[0] + 1, EBC_object);
                        /*
                        g_info = data_viz_d["positions"][d[1].toString()]
                        Print_Position_Info(g_info);
                        */
                    }; 
                    document.getElementById("zoom-out-btn").innerHTML = "Zoom Out";

                });

}

function UpdateBarcodeInfoForPosition(pos, EBC_object) {
 /*
  * pos: (int) The base-pair position
  * EBC_object: (d)
  *     pos_to_insertion_num_and_barcodes_d: (d)
  *
        str(int) -> pos_obj
            pos_obj (object)
                nIns: Num,
                str(+/-) -> list<barcode>
                barcode (str) a list of 20 nucleotides "A","C","T","G"
  *     
  *
  */



    removeAllChildNodes(document.getElementById(BCdefaults["data"][
               "Barcodes_Display_Info"]["strand_display_object"]["id_i"]["parent_id"]));

    removeAllChildNodes(document.getElementById(BCdefaults["data"][
               "Barcodes_Display_Info"]["barcodes_display_object"]["id_i"]["parent_id"]));


    let pos_obj = EBC_object["pos_to_insertion_num_and_barcodes_d"][pos.toString()];
    
    let strand_innerHTML = "";
    let barcodes_innerHTML = "";
    let strands = ["+", "-"];
    for (let g = 0; g<2; g++) {
        st = strands[g];
        if (pos_obj) {
            if (st in pos_obj) {
                strand_innerHTML += "<p>" + st + "</p>";
                barcodes_innerHTML += "<p>";
                for (let bi = 0; bi < pos_obj[st].length; bi++) {
                    barcodes_innerHTML += pos_obj[st][bi] + ",  ";
                }
                barcodes_innerHTML = barcodes_innerHTML.slice(0, -3);
                barcodes_innerHTML += "</p>";
            }
        }
    }
    

    let strand_display_obj = LUCreateElementFromInfo(BCdefaults["data"][
                            "Barcodes_Display_Info"]["strand_display_object"]);

    strand_display_obj.innerHTML = strand_innerHTML;


    let barcodes_display_obj = LUCreateElementFromInfo(BCdefaults["data"][
                            "Barcodes_Display_Info"]["barcodes_display_object"]);

    barcodes_display_obj.innerHTML = barcodes_innerHTML;


}


function UpdateSurroundingSequence(pos, EBC_object) {
 /*
  * pos: (int) The base-pair position
  * EBC_object: (d)
  *     scaffold_sequence: (str) A string of the entire scaffold
  *
  *
  */
    let Seq_inner_HTML = "<p>";
    Seq_inner_HTML += EBC_object["scaffold_sequence"].slice(pos-20, pos);
    Seq_inner_HTML += "  ^  ";
    Seq_inner_HTML += EBC_object["scaffold_sequence"].slice(pos, pos+20);
    Seq_inner_HTML += "</p>";
    document.getElementById(BCdefaults["lyt_vls"][
            "Surrounding_seq_display_div"]["id_i"]["id"]).innerHTML = Seq_inner_HTML;



}


function GetScaledValue(inp_N, axis_typ, min_val, max_val, x_org, y_org, graph_size_info_d ) {
    /*
    Args: inp_N is an integer
    axis_typ: (str) either "x" or "y"

    Returns:


    */
    if (axis_typ == "x") {
        return x_org[0] + graph_size_info_d["x_axis_length"]*(inp_N - min_val)/(max_val - min_val);
    } else if (axis_typ == "y") {
        return y_org[1] - (graph_size_info_d["y_axis_length"]*(inp_N - min_val)/(max_val - min_val));
    } else {
        return "Error: axis_typ must be 'x' or 'y'  "
    }

}

function GetProperTicks(start_val, end_val) {
    /*
    This function is to get properly spread ticks between
    two values, primarily on the y axis.

    Returns:
        ticks_list = [start_val, start_val + subdivs, start_val + 2subdivs,..., end_val]
    */

    if (start_val == end_val) {
        throw "Error: cannot get ticks for equal values " + start_val + " " + end_val;
    }

    let subdivs = ConvertValueIntoSubDivs(end_val - start_val);
    let tick_values = GetTickValues(start_val, end_val, subdivs);
    return tick_values;
}


function ConvertValueIntoSubDivs(Val) {
    /*
    Important Questions:
    1. Max ticks in axis assuming no more than 3 digits per value?
        Answer: 16
    2. Min ticks in axis?
        Answer: 8

    Meaning: 
        if N = d * 10^n, d > 5 implies division is 5 * 10^(n-2)
        4 < d < 5 implies division is  2.5 * 10^(n-2)
        2 < d < 4 implies division is  2 * 10^(n-2)
        1 < d < 2 implies division is 1 * 10^(n-2)
    */

    let val_info = BaseNotation(Val, 10, 20);
    let dig = val_info[0];
    let power = val_info[1];
    let subdivs = null;

    if (power === 0) {
        subdivs = 1 ;
    } else {
            if (dig >=8) { 
            subdivs =  Math.pow(10,power);
            } else if (dig >= 6) { 
            subdivs = 5 * Math.pow(10, power-1);
            } else {
            subdivs = Math.floor(dig) * Math.pow(10, power-1);
            }
    }
    return subdivs;
}



function GetTickValues(start_val, end_val, subdivs) {

    /*We go from a value and subdivs to actual graph ticks


    Args:
        start_val: (int)
        end_val: (int)
        subdivs: (int)

    Returns:
        ticks_list = [start_val, start_val + subdivs, start_val + 2subdivs,...]

    Specifically, this function starts from start_val and adds subdiv until reaching
        end_val. Note that difference between start_val and end_val does not 
        need t
    */
    // First we get a list of just each tick, not the start and end ticks (no dbl)
    let init_tick_list = [start_val];

    let crnt_val = start_val + subdivs;

    while (crnt_val < end_val){
        init_tick_list.push(crnt_val);
        crnt_val = crnt_val + subdivs;
    }

    init_tick_list.push(end_val);


    return init_tick_list;

}


function BaseNotation(N, base, max_power) {

    /* We get power of base and digit multiplier.
        Eg. if N = 346, base = 10 we return [3.46, 2] because
            3.46 * 10^2 = 346 


    Args:
        N: int, number to find bounds for. MUST BE > 0
        base: int 
        max_power: int (limit so function doesn't run forever with while loop)

    Returns:
        [a, b (power of 10)] where a*10^b = N
        OR [-1, -1] if it failed for some reason

    */

    if (N <= 0) {
        return [-1, -1]
    }
    for (let i=0; i < max_power + 1 ;i++){
        if (N >= Math.pow(base,i) && N < Math.pow(base,i+1)) {
            return [ N/Math.pow(base,i), i]
        }
    }

    return [-1, -1]

}

function Print_Position_Info(info_d) {
    /*
    This function gives info related to the barcode in a side panel.
    Important info: Strand, list of genes,
        a list of barcode sequences.

    Create a panel on the right of the SVG object

    Args:

       info_d: (d)
          "nIns": number of insertions (int),
          "+" or "-" -> position_info_d
              position_info_d:
                  "barcodes": list<str> each str a barcode of length 20,
                  ["genes"]: 
                    {gene_id (str) -> gene_info_d}
                    gene_info_d:
                        gene_pos_in_scaffold: (str) begin:end e.g. 
                            2345:3456
                        bc_pos_within_gene: (int) location of 
                            barcode within the gene
                        gene_length: (int)
                        bc_loc_percent_within_gene: (float) Starting 
                            position of insertion within gene
                        gene_desc: (str) Description of Gene
    */

    // FOR EACH STRAND we present information

    // strand_list will just be a list of the strands it appears on.
    
    strand_str = "";

    strands = ["+", "-"]
    strands.forEach(function(item, index) {
        if (Object.keys(info_d).includes(item)) { 
            strand_str += "<p>Strand: '" + item + "' </p>";
            strand_str += GetStrandHTMLText(info_d[item]);
        }
    })
    
    CreateSideScrollPanel(strand_str)
        

}

function GetStrandHTMLText(position_info_d) {
    /*
        Args:
            position_info_d: 
                  "barcodes": list<str> each str a barcode of length 20,
                  ["genes"]: 
                    {gene_id (str) -> gene_info_d}
                    gene_info_d:
                        gene_pos_in_scaffold: (str) begin:end e.g. 
                            2345:3456
                        bc_pos_within_gene: (int) location of 
                            barcode within the gene
                        gene_length: (int)
                        bc_loc_percent_within_gene: (float) Starting 
                            position of insertion within gene
                        gene_desc: (str) Description of Gene
        Returns:
            A string with p tags for spacing

        */

    
    barcodes_str = "<p>Barcodes: "
    if (Object.keys(position_info_d).includes("barcodes")) {
        barcodes_list = position_info_d["barcodes"];

        for (l=0; l<barcodes_list.length; l++) {
            barcodes_str += barcodes_list[l] + ", ";
        }
        // Removing the final comma and space
        barcodes_str = barcodes_str.slice(0, -2) + "</p>";
    }
    if (barcodes_str == "<p>Barcodes: ") {
                barcodes_str += " None</p>"
    }



    genes_str = "<p>Genes: </p>";
    if (Object.keys(position_info_d).includes("genes")) {
        genes_dict = position_info_d["genes"];
        gene_ids = Object.keys(genes_dict);
        for (l=0; l < gene_ids.length; l++ ) {
            gene_dict = genes_dict[gene_ids[l]]
                genes_str += " <p>Gene location in scaffold: " + gene_dict["gene_pos_in_scaffold"];
            genes_str += ". Barcode position in gene: " + gene_dict["bc_pos_within_gene"].toString();
            genes_str += ". Gene length: " + gene_dict["gene_length"].toString();
            genes_str += ". Barcode start percent of gene: " + 
                    (100*gene_dict["bc_loc_percent_within_gene"]).toString().slice(0,4) + "%" ;
                genes_str += ". Gene description: " + gene_dict["gene_desc"] + ".</p>  ";

        };
    }
    if (genes_str == "<p>Genes: </p>") {
                genes_str += "<p>None</p>"
    }

    return barcodes_str + genes_str;

}

function CreateSideScrollPanel(inp_str) {
    /*

    Args:
        inp_d (object):
            strand_str: (str)
            genes_str: (str)
            barcodes_str: (str)

    */

    //First remove original one: 
    st = document.getElementById("scroll-text")

    if (st) {
    document.body.removeChild(st)
    }

    scroll_p = document.createElement("div");
    new_style = "height:240px;width:240px;border:1px solid #ccc;";
    new_style +=  "font:16px/26px Georgia, Garamond, Serif;overflow:auto;";
    new_style += "position: absolute;"
    new_style += "left: " + (width + 150).toString() + "px;" + "top: " + margin.top.toString() + "px;";
    scroll_p.style =  new_style;
    scroll_p.id = "scroll-text"
    scroll_p.innerHTML = inp_str;
    document.body.appendChild(scroll_p);

}



function ZoomOutView(back_up_list, svg_d3, graph_size_info_d, scf_length, EBC_object) {
    /*
    We go backwards in the view as well as remove location text. Using the list
    "back_up_list": list<range_str>
    range_str: (str) start_val + "-" + end_val, e.g. "1400-1500"
    */
    
    /*
    //We remove location text if it exists 
    st = document.getElementById("scroll-text")

    if (st) {
        document.body.removeChild(st)
    }
    */



    if (back_up_list.length > 1) {
        range_to_go = back_up_list[back_up_list.length - 2];
        back_up_list.pop();
        if (back_up_list.length === 1) {
            let zm_out_btn = document.getElementById("zoom-out-btn");
            zm_out_btn.innerHTML = "Fully Zoomed Out";
            //ResetSVG()
            let first_inp_data = GetSVGInputData(0, 
                                    scf_length, 
                                    EBC_object["loc_to_bar_data"]);

            ResetSVG(first_inp_data, svg_d3, graph_size_info_d, back_up_list, EBC_object);

        } else {
            start_val = parseInt(range_to_go.split("-")[0]);
            end_val = parseInt(range_to_go.split("-")[1]);
            UpdateSVG(start_val, end_val, svg_d3, graph_size_info_d, back_up_list, EBC_object) 
        }
    } else {
        alert("Already fully zoomed out");
    }

}

