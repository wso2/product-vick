/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import DependencyGraph from "./DependencyGraph";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import {withStyles} from "@material-ui/core/styles";
import React, {Component} from "react";

const graphConfig = {
    directed: true,
    automaticRearrangeAfterDropNode: false,
    collapsible: false,
    height: 800,
    highlightDegree: 1,
    highlightOpacity: 0.2,
    linkHighlightBehavior: true,
    maxZoom: 8,
    minZoom: 0.1,
    nodeHighlightBehavior: true,
    panAndZoom: false,
    staticGraph: false,
    width: 1400,
    d3: {
        alphaTarget: 0.05,
        gravity: -1500,
        linkLength: 150,
        linkStrength: 1
    },
    node: {
        color: "#d3d3d3",
        fontColor: "black",
        fontSize: 18,
        fontWeight: "normal",
        highlightColor: "red",
        highlightFontSize: 18,
        highlightFontWeight: "bold",
        highlightStrokeColor: "SAME",
        highlightStrokeWidth: 1.5,
        labelProperty: "name",
        mouseCursor: "pointer",
        opacity: 1,
        renderLabel: true,
        size: 600,
        strokeColor: "green",
        strokeWidth: 2,
        svg: "green-cell.svg"
    },
    link: {
        color: "#d3d3d3",
        opacity: 1,
        semanticStrokeWidth: false,
        strokeWidth: 4,
        highlightColor: "black"
    }
};

const styles = {
    card: {
        minWidth: 275
    },
    title: {
        fontSize: 14
    },
    pos: {
        marginBottom: 12
    }
};

const cardCssStyle = {
    width: 300,
    height: 300,
    position: "fixed",
    bottom: 0,
    right: 0,
    top: 70
};

class Overview extends Component {

    constructor(props) {
        super(props);
        this.defaultState = {
            summary: {
                topic: "VICK Deployment",
                content: [
                    {
                        key: "Total cells",
                        value: ""
                    },
                    {
                        key: "Successful cells",
                        value: ""
                    },
                    {
                        key: "Failed cells",
                        value: ""
                    },
                    {
                        key: "Warning cells",
                        value: ""
                    }
                ]
            },
            data: {
                nodes: null,
                links: null,
            },
            error: null,
            reloadGraph: true
        };
        this.state = JSON.parse(JSON.stringify(this.defaultState));
        fetch("http://localhost:9123/dependencyModel/graph")
            .then(res => res.json())
            .then(
                (result) => {
                    let summaryContent = [
                        {
                            key: "Total cells",
                            value: result.nodes.length
                        },
                        {
                            key: "Successful cells",
                            value: result.nodes.length
                        },
                        {
                            key: "Failed cells",
                            value: "0"
                        },
                        {
                            key: "Warning cells",
                            value: "0"
                        }
                    ];
                    this.defaultState.summary.content = summaryContent;
                    this.setState((prevState) => ({
                        data: {
                            nodes: result.nodes,
                            links: result.edges
                        },
                        summary: {
                            ...prevState.summary,
                            content: summaryContent
                        }
                    }));

                    // TODO: testing...
                    // let nodeName = "Harry";
                    // const results = {
                    //     nodes: [
                    //         {id: nodeName, svg: "green-cell.svg", onMouseOverNode: this.onMouseOverCell},
                    //         {id: "Sally", svg: "yello-cell.svg", onMouseOverNode: this.onMouseOverCell},
                    //         {id: "Alice", onMouseOverNode: this.onMouseOverCell},
                    //         {id: "Sinthuja", onMouseOverNode: this.onMouseOverCell}
                    //     ],
                    //     links: [{source: nodeName, target: "Sally"}, {source: nodeName, target: "Alice"}]
                    // };
                    // this.setState({
                    //     data: {
                    //         nodes: results.nodes,
                    //         links: results.links
                    //     }
                    // });
                },
                (error) => {
                    this.setState({error: error});
                }
            );
        this.onClickCell = this.onClickCell.bind(this);
        this.onClickGraph = this.onClickGraph.bind(this);
    }

    onClickCell(nodeId) {
        let outbound = new Set();
        let inbound = new Set();
        this.state.data.links.map((element) => {
            if (element.source === nodeId) {
                outbound.add(element.target);
            } else if (element.target === nodeId) {
                inbound.add(element.source);
            }
        });
        this.setState((prevState) => ({
            summary: {
                ...prevState.summary,
                topic: `Cell : ${nodeId}`,
                content: [
                    {
                        key: "Outbound Cells",
                        setValue: this.popluateArray(outbound)
                    },
                    {
                        key: "Inbound Cells",
                        setValue: this.popluateArray(inbound)
                    }

                ]
            },
            reloadGraph: false
        }));
    }

    popluateArray(setElements) {
        let arrayElements = [];
        setElements.forEach((setElement) => {
            arrayElements.push(setElement);
        });
        return arrayElements;
    }

    onClickGraph() {
        this.setState({
            summary: JSON.parse(JSON.stringify(this.defaultState)).summary,
            reloadGraph: true
        });
    }


    render() {
        const {classes} = this.props;
        return (
            <div>
                <DependencyGraph
                    id="graph-id"
                    data={this.state.data}
                    config={graphConfig}
                    reloadGraph={this.state.reloadGraph}
                    onClickNode={this.onClickCell}
                    onClickGraph={this.onClickGraph}
                />
                <Card className={classes.card} style={cardCssStyle} transformOrigin={{
                    vertical: "top",
                    horizontal: "right"
                }}>
                    <CardContent>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                            Summary
                        </Typography>
                        <Typography variant="h5" component="h2">
                            {this.state.summary.topic}
                        </Typography>
                        <br/>
                        {this.state.summary.content.map((element) => <Typography variant="subtitle1" key={element.key}
                                                                                 gutterBottom>
                                {element.key} : {element.value}
                                {(element.setValue && element.setValue.length > 0) &&
                                (<ul>
                                    {element.setValue.map((setValueElement) => <li>{setValueElement}</li>)}
                                </ul>)
                                }
                                {!(element.value || (element.setValue && element.setValue.length > 0)) ? "None" : ""}
                            </Typography>
                        )}

                    </CardContent>
                </Card>
            </div>
        );
    }

}

Overview.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Overview);