
/*
 * Main funcs:
 * MakeAllScaffoldsGraph
 * MakeSingleScaffoldGraph
 *
 * Divide Making Axis into MakeAllScaffoldAxes
 * and MakeSingleScaffoldAxis.
 *
 * Make expand button have a plus
 *
 *
 */

function GetDefaultVariables() {

        x_i = MhtnDefaults["x_i"] ;
        y_i = MhtnDefaults["y_i"];
}
           
function FullProgram() {
        /*
        To Do:
            Sort scaffolds by size?

            Should we have the Standard Deviation per scaffold, 
                or should we have the standard deviation for all insertions 
                within the bug? Allow for option.
                Note within graph if SD and mean taken over all scaffolds,
                or per each scaffold.
                Note the SD and the mean IF it's taken over all scaffolds
                instead of per each.

            

            Inputs should in their own config file as well

            Zoom using Brush

         

        Note:
        "c_info" is name of input data
        "c_info["analysis_type"]" Gives you the type of analysis: whether per-scaffold,
            or per-genome.

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

        // Set the page size
        SetPageSize(MhtnDefaults["scale_val"]);

        // Do we need this margin? 
        margin = MhtnDefaults["SVG_graph_info"]["margin"];

        // Setting svg values
        svg_prp = MhtnDefaults["SVG_graph_info"]["svg_dimensions"];

        // Setting graph origin. 
        org = [MhtnDefaults["SVG_graph_info"]["origin"]["x"], MhtnDefaults["SVG_graph_info"]["origin"]["y"]];

        svg_i = {"width": svg_prp.width , 
            "height": svg_prp.height, 
            "scaffold_bool": false }


        var dv = document.createElement("div");
        dv.style.top = "50px";
        dv.style.width = "100%";
        dv.style.position = "absolute";
        dv.id = "svg-div";
        document.body.appendChild(dv)
        
        svg_obj = MakeAndGetSVG("svg-div", svg_prp.width, svg_prp.height, 
                                                svg_prp.left, 
                                                svg_prp.right, 
                                                svg_prp.top, svg_prp.bottom);

        analysis_type = c_info["analysis_type"];

        console.log("Analysis Type: " + analysis_type)

        GetDefaultVariables()

        MakeAllScaffoldsGraph()


        AddTitle(org, x_axis_len);
        AddPositionDiv();
        //AddReturnButton();
        
        CreateToolTip()


}

function SetPageSize(scale_val) {
    //scale_val is a Number
    
    var scale = 'scale(' + scale_val.toString() + ')';
    document.body.style.webkitTransform =  scale;    // Chrome, Opera, Safari
    document.body.style.msTransform =   scale;       // IE 9
    document.body.style.transform = scale;     // General

}

function MakeAllScaffoldsGraph() {

        // Clear old SVG
        d3.selectAll("svg > *").remove();
        svg_obj = d3.select("svg")
        scaffolds_info_and_maxSD = OrderScaffoldNamesAndLengths(c_info, svg_obj); 
        scf_names_and_lengths = scaffolds_info_and_maxSD[0]
        max_SD = scaffolds_info_and_maxSD[1]

        //Remove return button if exists
        var return_btn = document.getElementById("return-btn");
        if (return_btn) {
            return_btn.parentNode.removeChild(return_btn);
        }

        // X axis_info: ticks will be lengths of scaffolds starting from 0
        x_i["x_ticks"] = scf_names_and_lengths
        x_i["x_label"] = "Scaffolds (Sorted by decreasing length)"

        // Y axis_info: ticks will be standard deviations above 0
        y_ticks = GetProperTicks(0, Math.round(max_SD + 1))
        y_i["y_ticks"] = y_ticks;
        y_i["y_label"] = "Z Score";

        
        z = MakeAllScaffoldAxes(svg_obj, org, x_i, y_i, svg_i);
        x_axis_len = z[0];
        y_axis_len = z[1];
        total_bp_len = z[2];

        graph_info = {
            "org": org, 
            "svg_obj": svg_obj,
            "min_circle_radius": 2.0,
            "max_circle_radius": 10.0,
            "x_axis_len": x_axis_len,
            "y_axis_len": y_axis_len,
            "color_list": ["red","blue", "green", "orange", "purple", "yellow", "pink"],
            "max_y_val": max_SD,
            "total_bp_len": total_bp_len
        };


        PopulateManhattanSkyline(svg_obj, scf_names_and_lengths, 
            c_info["scaffolds"], graph_info,
            false); 

}


function AddPositionDiv() {
        // This function adds the div and text which describes the point info
       
        p_i = MhtnDefaults["Position_Div_Info"]

        h_i = p_i["h_i"]
        // Adding the Info div
        var h = document.createElement(h_i["tag_type"]); // Create the H1 element 
        h.style.left = h_i["left"];
        h.style.top = h_i["top"];
        h.innerHTML = h_i["base_text"];
        h.id = h_i["h_id"]


        var pos_info_dv = document.createElement("div");
        pos_info_dv.style.top = p_i["top"];
        pos_info_dv.style.width = p_i["width"];
        pos_info_dv.style.position = p_i["position"];
        pos_info_dv.id = p_i["div_id"];
        pos_info_dv.appendChild(h);
        document.body.appendChild(pos_info_dv)

}


function AddReturnButton() {

        var rtn_btn = document.getElementById("return-btn");

        if (!rtn_btn) {

            rb = MhtnDefaults["Return_Btn_Info"]

            var return_btn = document.createElement("button");
            return_btn.style.top = rb["top"];
            return_btn.style.left = rb["left"];
            return_btn.style.width = rb["width"];
            return_btn.style.height = rb["height"];
            return_btn.style.position = rb["position"] ;
            return_btn.style.paddingBottom = rb["paddingBottom"];
            return_btn.style.backgroundColor = rb["bg_color"];
            return_btn.innerHTML = '<h3 style="color:' + rb["text_color"] + '">' + rb["inner_text"] + '</h3>';
            return_btn.id = rb["btn_id"];
            return_btn.style.cursor = "pointer";
            return_btn.onclick = function() {MakeAllScaffoldsGraph()};
            document.body.appendChild(return_btn)

        }


}


function AddTitle(org, x_axis_len) {

        // Args: org: [x_origin, y_origin], x_axis_len: (Number)

        // Adding the title
        var h = document.createElement("H1"); // Create the H1 element 
        h.style.left = (org[0] + x_axis_len/2 - 30).toString() + "px";
        h.style.top = "0px";
        h.style.position = "absolute";
        h.innerHTML = "Insertions Plot";
        // var t = document.createTextNode(); // Create a text element 
        // h.appendChild(t); // Append the text node to the H1 element 
        document.body.appendChild(h); // Append the H1 element to the document body 
}



function PopulateManhattanSkyline(svg_obj, scf_names_and_lengths, scfs_info, graph_info,
                                    single_scaff_bool) {
    /*
     * Args:
     *  svg_obj: An svg object
     *  scf_names_and_lengths: list<[scaffold_name (str), scaffold_length (int), scaffold_start (int)]>
     *  scfs_info:
     *      scaffold_name -> scaffold_info_d
     *          scaffold_info_d: (d) Contains keys
     *              scaffold_length: (str)
     *              max_SD: (Number)
     *              mean: (Number)
     *              SD: (Number)
     *              pos_to_SD_ratio_l: list<[position, SD above mean]>
     *              [color]: string (If included retains the color of the scaffold)
     *  graph_info: (d)
     *      org: [x Number, y Number] Graph origin
     *      svg_obj: d3 object
     *      min_circle_radius: (Number)
     *      max_circle_radius: (Number)
     *      x_axis_len: Number
     *      y_axis_len: Number
     *      color_list: list<color_str>;
     *          color_str: (string) The colors to go through while building the skyline.
     *      max_y_val: (Number) Represents highest Standard Deviation,
     *          All circle sizes are filled in ratio to this number
     *  single_scaff_bool: (Boolean) Whether or not it's displaying a single scaffold
     *     total_bp_len: Number (sum of lengths of all scaffolds)
     */

    // Here we maintain a list of scaffolds to colors for later expansion
    scaffold_to_color_obj = {};
    color_list = graph_info["color_list"];
    next_scf_x_start_point = graph_info["org"][0];

    for ( i=0; i < scf_names_and_lengths.length; i++) {
        scf_name = scf_names_and_lengths[i][0]
        scaffold_info_d = scfs_info[scf_name];


        if (Object.keys(scaffold_info_d).includes("color")) {
            
            graph_info["current_color"] = scaffold_info_d["color"]; 
            
        } else {
            scaffold_info_d["color"] = graph_info["color_list"][i % color_list.length];

            graph_info["current_color"] = scaffold_info_d["color"]; 

            // We update table values
            scf_link_obj = d3.select("#" + ScaffoldNameToValidHTMLID(scf_name) + 
                        "-link");
            scf_link_obj.style('color', scaffold_info_d["color"])
                .data([scf_name])
                .on("click", function(d) {
                    MakeSingleScaffoldGraph(svg_obj, d)
                });

        }

        // We do a deep copy of the object
        new_scf_i_d = JSON.parse(JSON.stringify(scaffold_info_d));
        
        graph_info["x_scaffold_start"] = next_scf_x_start_point;
        


        if (c_info["analysis_type"] == "AllGenomeStats") {
            new_scf_i_d["mean"] = c_info["mean"];
            new_scf_i_d["SD"] = c_info["SD"];
            new_scf_i_d["max_SD"] = c_info["max_SD"];
        }


        next_scf_x_start_point = CreateCirclesForScaffold(new_scf_i_d, 
                                graph_info, scf_names_and_lengths[i][0]);

    }


}


function CreateCirclesForScaffold(new_scf_i_d, graph_info, scaffold_name) {
    /*
     *
     * new_scf_i_d: (d) Contains keys
     *     scaffold_length: (int)
     *     mean: (Number)
     *     SD: (Number)
     *     max_SD: (Number)
     *     pos_to_SD_ratio_l: list<[position, SD above mean]>
     *
     * graph_info: (d)
     *     svg_obj: d3 object
     *     min_circle_radius: (Number)
     *     max_circle_radius: (Number)
     *     max_y_val: (Number) Represents highest Standard Deviation,
     *          All circle sizes are filled in ratio to this number
     *     color_list: list<color_str>;
     *         color_str: (string) The colors to go through while building the skyline.
     *     current_color: (string) The color of these circles in this scaffold
     *     org: [x Number, y Number] Graph origin
     *     x_axis_len: Number
     *     y_axis_len: Number
     *     x_scaffold_start: Number
     *     total_bp_len: Number (sum of lengths of all scaffolds)
     *
     *
     * scaffold_name: (str) 
     */

    pos_l = new_scf_i_d["pos_to_SD_ratio_l"];
    minc = graph_info["min_circle_radius"];
    maxc = graph_info["max_circle_radius"];
   
    // BELOW NEEDS TO BE UPDATED 
    scf_x_len = (new_scf_i_d["scaffold_length"]/graph_info["total_bp_len"])*(
                                                            graph_info["x_axis_len"]);

    for (j=0; j <pos_l.length; j++ ) {
        // pos_SD is a list of [position (int), SD (number)]
        pos_SD = pos_l[j];

        // Calculating the center of the circle. We only draw circles with SD > 0;
        if (pos_SD[1] > 0 && new_scf_i_d["scaffold_length"] > 0 && graph_info["max_y_val"] > 0) {
            circle_radius =  minc + (maxc - minc)*(pos_SD[1]/graph_info["max_y_val"]);
            cx = graph_info["x_scaffold_start"] + (pos_SD[0]/new_scf_i_d["scaffold_length"])*scf_x_len
            cy = graph_info["org"][1] - graph_info["y_axis_len"]*(pos_SD[1]/graph_info["max_y_val"])

            // Drawing the circle
            graph_info["svg_obj"].append("circle")
                                .attr("cx", cx)
                                .attr("cy", cy)
                                .attr("r", circle_radius)
                                .attr("fill", graph_info["current_color"])
                                .attr("opacity", 0.5)
                                .data([pos_SD])
                                .on("click", function(d) {
                                    pos_i = document.getElementById("MH-point-info");
                                    inner_HTML = "Point info: ";
                                    inner_HTML += "Scaffold: " + scaffold_name + ". "; 
                                    point_pos = d[0].toString();
                                    inner_HTML += "Position: " + prep_int(point_pos) + ". ";
                                    num_insertions = Math.round(
                                        new_scf_i_d["mean"] + new_scf_i_d["SD"]*d[1]
                                    );
                                    inner_HTML += " # Insertions: " + prep_int(num_insertions);
                                    pos_i.innerHTML = inner_HTML;
                                });

        }

    }

    // Returning the next starting point
    return graph_info["x_scaffold_start"] + scf_x_len;

}


function OrderScaffoldNamesAndLengths(inp_d, svg_obj) {
    /*
     *
     *
     * The point of this function is to take the dict of all scaffolds
     *     and sort them by some form, then order the X axis by
     *     them and their respective lengths?
     *  inp_d: 
     *      analysis_type: (str)
     *      scaffolds: scaffold_info_d
     *          scaffold_info_d:
     *              scaffold_name (str) -> scaffold_info_d (d)
     *                  scaffold_info_d: (d) Contains keys
     *                     scaffold_length: (int)
     *                     max_SD: (Number)
     *                     mean: (Number)
     *                     SD: (Number)
     *                     pos_to_SD_ratio_l: list<[position, SD above mean]>
     *
     * Returns
     *      tuple: <scfld_length_array, max_SD_for_all_scf>
     *          scfld_length_array: list<[scaffold_name (str), scaffold_length (int), scaffold_start (int)]>
     *          max_SD_for_all_scf: Number: the total max Standard deviation
     *
     */

    scfld_info_d = inp_d["scaffolds"]

    scfld_names = Object.keys(scfld_info_d);

   
    
    // We sort scaffolds by length of scaffold
    sorted_scf_names_and_lengths = []
    for (i = 0; i<scfld_names.length; i++) {
        c_scf = scfld_names[i]; 
        sorted_scf_names_and_lengths.push([scfld_info_d[c_scf]["scaffold_length"],
                                            c_scf])
    }
    sorted_scf_names_and_lengths.sort(SortByNum)

    //console.log(sorted_scf_names_and_lengths)
    CreateScaffoldInfoTable(svg_obj, sorted_scf_names_and_lengths)
    
    scfld_names = [];
    for (i=0; i<sorted_scf_names_and_lengths.length; i++) {

    scfld_names.push(sorted_scf_names_and_lengths[i][1])

    }

    //Testing End

    

    //scfld_names.sort()
    scfld_length_array = [];
    max_SD_for_all_scf = 0;
    total_bp_scf_start = 0;

    for (i = 0; i<scfld_names.length; i++) {

        scfld_length_array.push([scfld_names[i], scfld_info_d[scfld_names[i]]["scaffold_length"],
                                total_bp_scf_start]);
        total_bp_scf_start += scfld_info_d[scfld_names[i]]["scaffold_length"];

        if (inp_d["analysis_type"] == "IndividualScaffoldStats") {

            if (scfld_info_d[scfld_names[i]]["max_SD"] > max_SD_for_all_scf) {
                max_SD_for_all_scf = scfld_info_d[scfld_names[i]]["max_SD"];
            }
        }
    };

    if (inp_d["analysis_type"] == "AllGenomeStats") {
        max_SD_for_all_scf = inp_d["max_SD"]
    }

    return [scfld_length_array, max_SD_for_all_scf];

}


function CreateScaffoldInfoTable(svg_obj, sorted_scf_names_and_lengths) {
    /* The point of the function is to make a table in javascript
     * which lists the scaffolds in order and their lengths.
     * 
     *  TD: Create a div in which the scaffolds lie
     *  Scroll to see all scaffolds
     *
     * Args:
     *     sorted_scf_names_and_lengths: list<scf_tp>
     *         scf_tp: [scf_length (int), scf_name (str)]
     * 
     */

    // Shorten the variable name
    sc_l = sorted_scf_names_and_lengths;

    var scfd_info_tb = document.getElementById("scaffold-info-table")
    
    // If it already exists we do nothing. If it does not, then we do the following
    if (!scfd_info_tb) {

        tt_i = MhtnDefaults["Info_Table"]["Table_Title_Info"] 
        td_i = MhtnDefaults["Info_Table"]["Table_Div_Info"] 

        // Creating Table Title
        var tbl_ttl = document.createElement(tt_i["tag_type"]); // Create the H1 element 
        tbl_ttl.style.left = tt_i["left"] ;
        tbl_ttl.style.top = tt_i["top"];
        tbl_ttl.style.position = tt_i["position"];
        tbl_ttl.innerHTML = tt_i["text"];
        tbl_ttl.id = tt_i["id"];
        document.body.appendChild(tbl_ttl); // Append the H1 element to the document body 
        

        // Creating div encompassing table
        var tbl_dv = document.createElement("div");
        tbl_dv.style.top = td_i["top"];
        tbl_dv.style.left = td_i["left"];
        tbl_dv.style.width = td_i["width"];
        tbl_dv.style.height = td_i["height"];
        tbl_dv.style.overflow = "auto";
        tbl_dv.style.position = td_i["position"];
        tbl_dv.id = td_i["id"];


        var tbl = document.createElement("TABLE");  


        for (r = sc_l.length-1; r >= 0; r--) {

            // Create an empty <tr> element and add it to the 1st position of the table:
            var row = tbl.insertRow(0);
            
            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            
            // Add scaffold name and then scaffold length
            
            // First the ranking of scaffold in terms of length
            cell1.innerHTML = (r + 1).toString();
            // Then the scaffold name and link
            scf_name = sc_l[r][1];
            let scf_link = document.createElement("a");
            scf_link.innerHTML = scf_name;
            scf_link.style.cursor = "pointer";
            scf_link.style.textDecoration = "underline";
            scf_link.id = ScaffoldNameToValidHTMLID(scf_name) + "-link";
            cell2.appendChild(scf_link);
            // Then the scaffold length
            cell3.innerHTML = prep_int(sc_l[r][0]) + " bp";
        }

        tbl.setAttribute("id", "scaffold-info-table");

        tbl_dv.appendChild(tbl);
        document.body.appendChild(tbl_dv)

    }




}

function ScaffoldNameToValidHTMLID(scf_name) {

    newscf = scf_name.replace("/","-");

    return newscf

}


function SortByNum(a,b) {
    if (a[0] < b[0]) return 11;
   if (a[0] > b[0]) return -1;
   return 0;
}


function MakeAndGetSVG(parent_div_id, width, height, left, right, top, bottom) {
    /*
     * Args:
     *      parent_div_id: (str)
     *      width -> the rest: Number describing Svg
     */

        var svg = d3.select("#" + parent_div_id).append("svg")
            .attr("width", width)
            .attr("height", height )
            .attr("border", "1px solid #F0F0F0")
            .attr("transform", 
                  "translate(" + left + "," + top + ")")
            //.call(d3.zoom().on("zoom", function() {
            //    svg.attr("transform", d3.event.transform)
            //})
            //)
            .append("g");
        return svg

}

function MakeLine(svg_obj, color, x1, y1, x2, y2, stroke_width ) {
    /*
     * Args: 
     * svg_obj: A d3 svg object
     * color: str, like "black"
     * x1 - y2, Numbers
     * stroke_width: width of line, Number
     */

               return svg_obj.append('line')
                   .attr('x1', x1)
                   .attr('y1', y1)
                   .attr('x2', x2)
                   .attr('y2', y2)
                   .attr('stroke', color)
                   .attr('stroke-width', stroke_width);

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

//function MakeRect() {};

//function MakeCircle() {};
function MakeAllScaffoldAxes(svg_obj, org, x_i, y_i, svg_i) {
            /*
             *
             * TO DO: Make creation of axes function based.
             * Make plus button for each scaffold
            Here we create the axes - 
            Args:
               svg_obj: the d3 svg object to which we append values
               org: Graph origin (tuple) <x_start (Number), y_start (Number)>
               x_i: x_axis info
                    x_ticks: list<[scaffold_name (str), scaffold_length (int), scaffold_start (int)]>
                    x_label: (str) Label for x axis
                    x_label_font_size: (Number)
                    x_label_color: (str)
                    x_label_dst: (Number)
                    x_axis_color: (str)
                    x_axis_percent_len: (Number)
                    x_axis_stroke_width: (Number)
                    x_tick_len: (Number) Length of tick stroke
                    x_tick_stroke_width: (Number)
                    x_ticks_font_size: (Number)
                    x_tick_color: (Str)
               y_i: y axis info
                    y_ticks: list<int> The numbers in the axis 
                    y_label: (str) Label for y axis
                    y_label_font_size: (Number)
                    y_label_color: (str)
                    y_label_dst: (Number)
                    y_axis_color: (str)
                    y_axis_percent_len: (Number)
                    y_axis_stroke_width: (Number)
                    y_tick_len: (Number) Length of tick stroke
                    y_tick_stroke_width: (Number)
                    y_ticks_font_size: (Number)
                    y_tick_color: (str)
                svg_i:
                    width: Number
                    height: Number
                    scaffold_bool: (Boolean)
            Returns:
                [x_axis_len (Number), y_axis_len (Number), single_x_tick_len (Number)]
            */
            // The following (x_ticks) is a list with tuples of length 3 (IF FULL GENOME)
            // It is a list of ints if a single scaffold
            x_ticks = x_i["x_ticks"];
            let Xmin_num = 0;

            // We calculate lengths of all scaffolds together:
            Xmax_num = 0;
            for (i=0; i< x_ticks.length; i++) {
                Xmax_num += x_ticks[i][1]
            }

            y_ticks = y_i["y_ticks"];
            let Ymin_num = y_ticks[0];
            let Ymax_num = y_ticks[y_ticks.length -1];
            let Ydist = Ymax_num - Ymin_num;
            
            // First we create the axis lengths 
            x_axis_len = x_i["x_axis_percent_len"]*(1/100)*(svg_i["width"]);
            y_axis_len = y_i["y_axis_percent_len"]*(svg_i["height"])*(1/100);

            
            //Making X axis line (no ticks)
            MakeLine(svg_obj, "black", org[0], org[1], org[0] + x_axis_len, org[1], 
                    x_i["x_axis_stroke_width"]);

            //Making Y axis line (no ticks)
            MakeLine(svg_obj, "black", org[0], org[1], org[0], org[1] - y_axis_len, 
                    x_i["y_axis_stroke_width"]);
            

            // Labels
            // X-Axis Text Label
            MakeText(svg_obj, "bold", x_i["x_label_font_size"], org[0] + x_axis_len/3,
                    org[1] + x_i["x_label_dst"] + x_i["x_tick_len"], x_i["x_label"])
            
 
            // Y-Axis Text Label
            //var rotateTranslate = d3.svg.transform().rotate(-180);
            // .attr("transform", "translate(0,0) rotate(180)")
            Yx = org[0] - y_i["y_label_dst"] 
            Yy = org[1] - y_axis_len/2

            ax_tsl = Yx.toString() + "," + Yy.toString()

            svg_obj.append('text')
                .attr('font-weight', "bold")
                .attr("transform", "translate(" + ax_tsl + ") rotate(270)")
                .attr('font-size', y_i["y_label_font_size"])
                .text(y_i["y_label"]);


            //Then we add the ticks and text
            //  For X
            x_loc = org[0]
            for (i=0; i < x_ticks.length; i++) {
                crnt_tick_info = x_ticks[i];

                // Add the x tick  
                MakeLine(svg_obj, x_i["x_tick_color"], x_loc, org[1], x_loc, 
                            org[1] + x_i["x_tick_len"], x_i["x_tick_stroke_width"]);

              
                /*
                // Add the tick button label - Goes between two ticks starting at 1/5->4/5
                x_rect_loc = x_loc + x_axis_len/((x_ticks.length-1)*5)
                MakeExpandScaffoldButton(svg_obj, 
                                        x_rect_loc,
                                        (single_x_tick_len*3)/5,
                                        org[1] + x_i["x_tick_len"], 
                                        10, 
                                        crnt_tick_info[0]);
                */

                //MakeText(svg_obj, "normal", x_i["x_ticks_font_size"], x_text_loc, org[1] + x_i["x_tick_len"] + 15,
                //        crnt_tick_info[0]);


                x_loc += (crnt_tick_info[1]/Xmax_num)*(x_axis_len);
                

            }
            //Add the last tick for x-axis
            MakeLine(svg_obj, x_i["x_tick_color"], x_loc, org[1], x_loc, 
                            org[1] + x_i["x_tick_len"], x_i["x_tick_stroke_width"])



            //  For Y
            for (i=0; i < y_ticks.length; i++) {
                ytick = y_ticks[i];
                // We get y location
                let y_loc = org[1] - y_axis_len*(ytick - Ymin_num)/(Ydist);

                //Add the y tick  
                MakeLine(svg_obj, y_i["y_tick_color"],org[0], y_loc, org[0] - y_i["y_tick_len"],
                            y_loc,  y_i["y_tick_stroke_width"]);

                // Add the y text
                MakeText(svg_obj, "normal", y_i["y_ticks_font_size"], org[0] - y_i["y_tick_len"] - 15, y_loc + 5,
                        ytick.toString());

            }

            return [x_axis_len, y_axis_len, Xmax_num]

}

function CreateToolTip() {



    //We create a tooltip to describe the y axis

    tool_text = "Explanation: We calculate the mean by taking the total number of insertions ^" +
                "  and dividing that by the total number of locations with insertions.^" +
                "We compute the Standard Deviation using that mean. The Z-score for a ^" +
                "point is (#Insertions - Mean)/SD. We do not list any values whose Z-score ^" +
                "is below 0.";


    var b = tool_text.split('^');

    for (i = 0; i < b.length; i++) {
        c_txt_s = b[i];
        text_elem = document.createElement("P");
        text_elem.innerHTML = c_txt_s;
        text_elem.style.position = "absolute";
        text_elem.style.left = "400px";
        text_elem.style.top = (760 + i*20).toString() + "px";
        text_elem.style.fontWeight = "900"
        document.body.appendChild(text_elem)
    }

}


function MakeSingleScaffoldAxes(svg_obj, org, x_i, y_i, svg_i) {
            /*
             *
             * TO DO: Make creation of axes function based.
             * Make plus button for each scaffold
             * NOTE: There is a difference between circle location and tick location.
             *  Ticks are spread out evenly, whereas circles aren't. More calculations
             *  necessary.
            Here we create the axes - 
            Args:
               svg_obj: the d3 svg object to which we append values
               org: Graph origin (tuple) <x_start (Number), y_start (Number)>
               x_i: x_axis info
                    x_ticks: list<[scaffold_name (str), scaffold_length (int), scaffold_start (int)]>
                    x_label: (str) Label for x axis
                    x_label_font_size: (Number)
                    x_label_color: (str)
                    x_label_dst: (Number)
                    x_axis_color: (str)
                    x_axis_percent_len: (Number)
                    x_axis_stroke_width: (Number)
                    x_tick_len: (Number) Length of tick stroke
                    x_tick_stroke_width: (Number)
                    x_ticks_font_size: (Number)
                    x_tick_color: (Str)
               y_i: y axis info
                    y_ticks: list<int> The numbers in the axis 
                    y_label: (str) Label for y axis
                    y_label_font_size: (Number)
                    y_label_color: (str)
                    y_label_dst: (Number)
                    y_axis_color: (str)
                    y_axis_percent_len: (Number)
                    y_axis_stroke_width: (Number)
                    y_tick_len: (Number) Length of tick stroke
                    y_tick_stroke_width: (Number)
                    y_ticks_font_size: (Number)
                    y_tick_color: (str)
                svg_i:
                    width: Number
                    height: Number
                    scaffold_bool: (Boolean)
            Returns:
                [x_axis_len (Number), y_axis_len (Number), single_x_tick_len (Number)]
            */
            // The following (x_ticks) is a list with tuples of length 3 (IF FULL GENOME)
            // It is a list of ints if a single scaffold
            x_ticks = x_i["x_ticks"];
            let Xmin_num = 0;
            // The final X value is the start of the last scaffold plus its length
            let Xmax_num = x_ticks[x_ticks.length - 1]

            Kb_bool = false;
            if (x_ticks.length > 1) {

                if (x_ticks[1] - x_ticks[0] > 1000) {
                    Kb_bool = true;
                }

            }

            console.log(Xmax_num);
            console.log("x_ticks: ");
            console.log(x_ticks);


            y_ticks = y_i["y_ticks"];
            let Ymin_num = y_ticks[0];
            let Ymax_num = y_ticks[y_ticks.length -1];
            let Ydist = Ymax_num - Ymin_num;
            
            // First we create the axis lengths 
            x_axis_len = x_i["x_axis_percent_len"]*(1/100)*(svg_i["width"]);
            y_axis_len = y_i["y_axis_percent_len"]*(svg_i["height"])*(1/100);

            
            //Making X axis line (no ticks)
            MakeLine(svg_obj, "black", org[0], org[1], org[0] + x_axis_len, org[1], 
                    x_i["x_axis_stroke_width"]);

            //Making Y axis line (no ticks)
            MakeLine(svg_obj, "black", org[0], org[1], org[0], org[1] - y_axis_len, 
                    x_i["y_axis_stroke_width"]);
            

            // Labels
            // X-Axis Text Label
     
            if (Kb_bool) {
                x_axis_label_s = x_i["x_label"] + " Location (Kbp)"
            } else {
                x_axis_label_s = x_i["x_label"] + " Location (bp)"
            }
            
            MakeText(svg_obj, "bold", x_i["x_label_font_size"], org[0] + x_axis_len/3,
                    org[1] + x_i["x_label_dst"] + x_i["x_tick_len"], x_axis_label_s)
            
 
            // Y-Axis Text Label
            //var rotateTranslate = d3.svg.transform().rotate(-180);
            // .attr("transform", "translate(0,0) rotate(180)")
            Yx = org[0] - y_i["y_label_dst"] 
            Yy = org[1] - y_axis_len/2
            tsl = Yx.toString() + "," + Yy.toString()
            svg_obj.append('text')
                .attr('font-weight', "bold")
                .attr("transform", "translate(" + tsl + ") rotate(270)")
                .attr('font-size', y_i["y_label_font_size"])
                .text(y_i["y_label"]);


            //Then we add the ticks and text
            //  For X
          

            x_loc = org[0]

            for (i=0; i < x_ticks.length; i++) {
                crnt_tick_info = x_ticks[i];
                
                x_loc = org[0] + (crnt_tick_info/Xmax_num)*(x_axis_len)
                // Add the x tick  
                MakeLine(svg_obj, x_i["x_tick_color"], x_loc, org[1], x_loc, 
                            org[1] + x_i["x_tick_len"], x_i["x_tick_stroke_width"]);
               
                if (x_ticks.length > 1 && i > 0) {
                        if (!(i == x_ticks.length - 2)) {
                        //Here we make it so the second to last tick has no text
                        // for spacing purposes.

                        if (Kb_bool) {
                           c_tick_label_s = prep_int(Math.round(crnt_tick_info/1000));
                        } else {
                            c_tick_label_s = prep_int(crnt_tick_info); 
                        }

                        MakeText(svg_obj, "normal", x_i["x_ticks_font_size"], 
                              x_loc, org[1] + x_i["x_tick_len"] + 15,
                              c_tick_label_s);
                        }

                }

                //MakeText(svg_obj, "normal", x_i["x_ticks_font_size"], x_text_loc, org[1] + x_i["x_tick_len"] + 15,
                //        crnt_tick_info[0]);

                //x_loc += single_x_tick_len;

            }
            



            //  For Y
            for (i=0; i < y_ticks.length; i++) {
                ytick = y_ticks[i];
                // We get y location
                let y_loc = org[1] - y_axis_len*(ytick - Ymin_num)/(Ydist);

                //Add the y tick  
                MakeLine(svg_obj, y_i["y_tick_color"],org[0], y_loc, org[0] - y_i["y_tick_len"],
                            y_loc,  y_i["y_tick_stroke_width"]);

                // Add the y text
                MakeText(svg_obj, "normal", y_i["y_ticks_font_size"], org[0] - y_i["y_tick_len"] - 15, y_loc + 5,
                        ytick.toString());

            }

            return [x_axis_len, y_axis_len, Xmax_num]

}  


function MakeExpandScaffoldButton(svg_obj, tlc_x, width, tlc_y, height, scaffold_name) {
    /*
     *  Q: Are x and y top left corners?
     *
     */

            svg_obj.append('rect')
                .attr('x', tlc_x)
                .attr('y', tlc_y)
                .attr('width', width)
                .attr('height', height)
                .attr('fill', "paleturquoise")
                .attr("cursor", "pointer")
                .data([scaffold_name])
                .on("click", function(d) {
                    MakeSingleScaffoldGraph(svg_obj, d)
                });

            // We create plus symbol - Vertical line
            let c_l = MakeLine(svg_obj, "black", 
                    tlc_x + (width/2), 
                    tlc_y + 2, 
                    tlc_x + (width/2), 
                    tlc_y + height - 2, 
                    .5 )

            
            c_l.attr("cursor", "pointer")
                .data([scaffold_name])
                .on("click", function(d) {
                    MakeSingleScaffoldGraph(svg_obj, d)
                });
                

            // Plus symbol - Horizontal line
            let n_l = MakeLine(svg_obj, "black", 
                    tlc_x + 2, 
                    tlc_y + (height/2), 
                    tlc_x + width - 2, 
                    tlc_y + (height/2), 
                    .5)

            
            n_l.attr("cursor", "pointer")
                .data([scaffold_name])
                .on("click", function(d) {
                    MakeSingleScaffoldGraph(svg_obj, d)
                });
            

}

//NOW
function MakeSingleScaffoldGraph(svg_obj, scf_name) {
    /* This function embodies the entire process of creating a graph
     * Args:
     * svg_obj: d3 SVG object
     * scf_name: (str) Name of scaffold
     *
     */

    // We redraw the entire graph - clear SVG
    // Redo Y and X axis with single scaffold
    // X axis will have no ticks
    // Need 'go back' button.
    // Change X axis label to be just Scaffold Name

    // Clear old SVG
    d3.selectAll("svg > *").remove();
    svg_obj = d3.select("svg")

    //Make return button
    AddReturnButton();

    // scf_info_d contains keys: scaffold_length, pos_to_SD_ratio_l
    current_scf_info_d = c_info["scaffolds"][scf_name]
    console.log(current_scf_info_d);
    current_y_max_SD =  Math.round(current_scf_info_d["max_SD"])
    console.log(current_y_max_SD);
    //x_ticks = [[scf_name, current_scf_info_d["scaffold_length"], 0]]
    x_ticks = GetProperTicks(0, current_scf_info_d["scaffold_length"]);
    y_ticks = GetProperTicks(0, Math.round(current_scf_info_d["max_SD"] + 1))
    console.log(x_ticks);
    console.log(y_ticks);
    x_i["x_ticks"] = x_ticks;
    x_i["x_label"] = scf_name;
    y_i["y_ticks"] = y_ticks;
    svg_i["scaffold_bool"] = true;

    z = MakeSingleScaffoldAxes(svg_obj, org, x_i, y_i, svg_i);

    //NOW WE DRAW THE ACTUAL CIRCLES

    x_axis_len = z[0];
    y_axis_len = z[1];
    X_max_num = z[2];

    graph_info = {
        "org": org, 
        "svg_obj": svg_obj,
        "min_circle_radius": 2.0,
        "max_circle_radius": 10.0,
        "x_axis_len": x_axis_len,
        "y_axis_len": y_axis_len,
        "color_list": ["red","blue", "green", "orange", "purple", "yellow", "pink"],
        "max_y_val": current_scf_info_d["max_SD"],
        "total_bp_len": X_max_num
    };

    single_scaffold_d = {};
    single_scaffold_d[scf_name] = current_scf_info_d;
    single_scaffold_n_l = [[scf_name, current_scf_info_d["scaffold_length"], 0]];
    PopulateManhattanSkyline(svg_obj, single_scaffold_n_l, single_scaffold_d, graph_info, true); 


}



function GetProperTicks(start_val, end_val) {
    /*
    This function is to get properly spread ticks between
    two values, primarily on the y axis.
    start_val: Number
    end_val Number

    Returns:
        ticks_list = [start_val, start_val + subdivs, start_val + 2subdivs,..., end_val]
    */
    subdivs = ConvertValueIntoSubDivs(end_val - start_val);
    tick_values = GetTickValues(start_val, end_val, subdivs);
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

    val_info = BaseNotation(Val, 10, 20);
    dig = val_info[0];
    power = val_info[1];

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
    init_tick_list = [start_val];

    crnt_val = start_val + subdivs;

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
    for (i=0; i < max_power + 1 ;i++){
        if (N >= Math.pow(base,i) && N < Math.pow(base,i+1)) {
            return [ N/Math.pow(base,i), i]
        }
    }

    return [-1, -1]

}

//END CODE IN USE




function BrushCode() {

        //BRUSH CODE: CURRENTLY NOT IN USE

         // Add a clipPath: everything out of this area won't be drawn.
        var clip = svg_obj.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", svg_i["width"] )
            .attr("height", svg_i["height"] )
            .attr("x", 0)
            .attr("y", 0);
         

        // Add brushing - making global var
         brush = d3.brushX()                 // Add the brush feature using the d3.brush function
            .extent( [ [0,0], [svg_i["width"], svg_i["height"]] ] ) 
        // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function


        // Color scale: give me a specie name, I return a color
        var color = d3.scaleOrdinal()
        .domain(["setosa", "versicolor", "virginica" ])
        .range([ "#440154ff", "#21908dff", "#fde725ff"])

    // Create the scatter variable: where both the circles and the brush take place (global)
    scatter = svg_obj.append('g')
    .attr("clip-path", "url(#clip)")

      // Add the brushing
        scatter
            .append("g")
            .attr("class", "brush")
            .call(brush);

}


function updateChart() {
       
    // Assume extent contains array with info regarding brush
    extent = d3.event.selection
 
    // extent[0] is first X value, extent[1] is second X value
    console.log(extent);


        // Above removes the grey brush area as soon as the selection has been done
 
     // Can we create a transitional zoom that only displays values within a range?
 
 
    /*
    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if(!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
      x.domain([ 4,8])
    }else{
      x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
      scatter.select(".brush").call(brush.move, null) 
        // Above removes the grey brush area as soon as the selection has been done
    }
 
    // Update axis and circle position
    xAxis.transition().duration(1000).call(d3.axisBottom(x))
    scatter
      .selectAll("circle")
      .transition().duration(1000)
      .attr("cx", function (d) { return x(d.Sepal_Length); } )
      .attr("cy", function (d) { return y(d.Petal_Length); } )
    */

} 



function prep_int(inp_i){
    /*
     * Converts an integer input into a comma separated string
     * i.e. 1000 -> 1,000
     * Currently Python
     *
     * Args:
     *     inp_i: Input integer 
     *
     * 
     */

    
    int_l = inp_i.toString().split('');

    op_str = '';
    while (int_l.length > 3) {
        c_char = int_l.shift();
        op_str += c_char;
        if (int_l.length % 3 == 0) {
            op_str += ",";
        }
    }

    op_str += int_l.join('') 

    return op_str
}


