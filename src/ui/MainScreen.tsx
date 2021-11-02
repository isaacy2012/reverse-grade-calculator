import styled from "styled-components";
import React, {Fragment, useCallback, useEffect, useState} from "react";
import {Instruction} from "./Instruction";
import Title from "./Title";
import Table from "./Table";
import {Assignment, SerializableAssignment} from "../model/Assignment";
import ContentRow from "./ContentRow";
import {Container} from "./Container";
import {InputChangeEvent, StyledInput} from "./StyledInput";
import Tabbed from "./Tabbed";
import Tab from "./Tab";
import PercentageTab from "./output/PercentageTab";
import GradeTab from "./output/GradeTab";
import {encode, decode} from "base-64";
import {useHistory, useLocation} from "react-router-dom";
import {parseJSON} from "../util/Deserializer";
import {NoPaddingCard} from "./Card";
import {RiShareForward2Fill} from "react-icons/ri";
import ShareSheet from "./ShareSheet";
import {useIdleTimer} from "react-idle-timer";
import {PercentageResult} from "../model/PercentageResult";
import {DEFAULT_OUT_OF} from "../util/Constants";


const TableHeader = styled(StyledInput)`
  width: 100%;
  font-size: 2em;
  font-weight: bold;
  border: none;
`

const InvisibleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  white-space: pre;
  font-size: 1.1em;
  //font-weight: 600;
  margin: 0;
  padding: 15px;
  width: 100%;
  background: none;
  border: none;
  border-radius: 10px;

    // color: ${({theme}) => theme.color.outlineReject};
`

const InvisibleLink = styled.a`
    text-decoration: none;
`

// const dummyAssignments: Assignment[] = [
//     Assignment.fromStrings("Assignment 1", "49/50", "0.025", uuidv4().toString()),
//     Assignment.fromStrings("Project 1", "98/100", "0.15", uuidv4().toString()),
//     Assignment.fromStrings("Assignment 2", "47/50", "0.025", uuidv4().toString()),
//     Assignment.fromStrings("Assignment 3", "40/40", "0.025", uuidv4().toString()),
//     Assignment.fromStrings("Project 2", "43/43", "0.15", uuidv4().toString()),
//     Assignment.fromStrings("Assignment 4", "24.5/30", "0.025", uuidv4().toString()),
// ]

const defaultAssignments: Assignment[] = []

/**
 * getQuery from location for id string
 */
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function MainScreen() {
    const [assignments, setAssignments] = useState<Assignment[]>([...defaultAssignments, Assignment.ofAdd()]);
    const [shareExpanded, setShareExpanded] = useState<boolean>(false);
    const [title, setTitle] = useState<string>("");
    const percentageThreshState = useState("");
    const outOfState = useState("");
    const outOfStr = outOfState[0];
    const threshStr = percentageThreshState[0];

    const outOf = parseFloat(outOfStr);
    const result = React.useMemo(() =>
            PercentageResult.create(assignments.slice(0, -1), threshStr, !isNaN(outOf) ? outOf : DEFAULT_OUT_OF),
        [assignments, threshStr, outOf]
    );

    const history = useHistory();

    let queryString = useQuery().get("saved");
    let fillSavedAssignments = useCallback(() => {
        let encodedCurrent = encode(
            JSON.stringify(
                {title: title, assignments: assignments
                        .slice(0, -1)
                        .map((it) => (it as SerializableAssignment).fullJSON())}
            )
        );
        if (queryString && queryString !== encodedCurrent) {
            let loadedData = parseJSON(decode(queryString));
            if (loadedData !== null) {
                setTitle(loadedData.title);
                setAssignments([
                    ...loadedData.assignments,
                    Assignment.ofAdd()
                ]);
            }
        }
    }, [assignments, queryString, title])

    useEffect(() => {
        fillSavedAssignments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function saveAndPushData() {
        let encodedCurrent = encode(
            JSON.stringify(
                {title: title, assignments: assignments
                        .filter(it => it instanceof SerializableAssignment)
                        .map((it) => (it as SerializableAssignment).fullJSON())}
            )
        );
        console.log("saved: " +
            JSON.stringify(
                {title: title, assignments: assignments
                        .filter(it => it instanceof SerializableAssignment)
                        .map((it) => (it as SerializableAssignment).fullJSON())}
            )
        );

        if (queryString !== encodedCurrent) {
            // refresh
            let params = new URLSearchParams();
            params.append("saved", encodedCurrent);
            history.replace({search: params.toString()});
        }
    }

    useIdleTimer({
        timeout: 1000,
        onIdle: saveAndPushData,
        debounce: 500
    })

    function duplicateAssignment(index: number) {
        setAssignments((currentAssignments) => {
            let newArr = [...currentAssignments];
            let assignmentToDuplicate = currentAssignments[index];
            let newAssignment = assignmentToDuplicate.clone();
            newArr.splice(index, 0, newAssignment);
            return newArr;
        });
    }

    function deleteAssignment(index: number) {
        setAssignments((currentAssignments) => {
            let newArr = [...currentAssignments];
            newArr.splice(index, 1);
            return newArr;
        });
    }

    function updateAssignment(assignment: Assignment, index: number) {
        if (assignments[index].equals(assignment)) {
            // console.log("unfortunately, " + JSON.stringify(assignments[index]) + " was equal to " + JSON.stringify(assignment))
            return;
        }
        setAssignments((currentAssignments) => {
            let newArr = [...currentAssignments];
            newArr[index] = assignment;
            return newArr;
        });
    }

    function addRow() {
        setAssignments((currentAssignments) => {
            let newArr = [...currentAssignments];
            newArr.push(Assignment.ofAdd());
            return newArr;
        });
    }

    return (
        <Fragment>
            <Container bottom="50px">
                <InvisibleLink href={process.env.PUBLIC_URL}><Title>Grade Calculator</Title></InvisibleLink>
                <Instruction>Enter your assignment information, then choose whether you want to reach
                    a <b>percentage</b> or <b>grade</b>.</Instruction>
            </Container>
            <Table title={
                <TableHeader
                    value={title}
                    onChange={(event: InputChangeEvent) => setTitle(event.target.value)}
                    placeholder="Title"/>
            } headers={["ASSIGNMENT", "SCORE", "WEIGHT"]}
            hints={["", "% or X/Y", "%"]}>
                {assignments.map((value, index) => <ContentRow
                    key={value.uuid}
                    assignment={value}
                    onChange={(assignment: Assignment) => updateAssignment(assignment, index)}
                    onClick={index === assignments.length - 1 ? addRow : undefined}
                    onDuplicate={() => duplicateAssignment(index)}
                    onDelete={() => deleteAssignment(index)}
                />)}
            </Table>
            <Container top="20px">
                <Tabbed defaultActiveTabName="REACH_PERCENTAGE"
                        headerNames={["REACH_PERCENTAGE", "REACH_GRADE"]}
                        headerElements={[<span>% Reach a <b>percentage</b></span>,
                            <span>A+ Reach a <b>grade</b></span>]}>
                    <Tab tabName="REACH_PERCENTAGE">
                        {/*remove the last empty assignment (the add button)*/}
                        <PercentageTab result={result}
                                       threshState={percentageThreshState}
                                       outOfState={outOfState}
                        />
                    </Tab>
                    <Tab tabName="REACH_GRADE">
                        {/*remove the last empty assignment (the add button)*/}
                        <GradeTab result={result}/>
                    </Tab>
                </Tabbed>
            </Container>
            <Container>
                <NoPaddingCard marginTop="20px">
                    <InvisibleButton onClick={() => setShareExpanded((prev) => !prev)}>
                        <RiShareForward2Fill/> SHARE
                    </InvisibleButton>
                    {shareExpanded &&
                    <ShareSheet title={title} assignments={assignments.slice(0, -1)}/>}
                </NoPaddingCard>
            </Container>
            {/*{assignments.map((value, index) => <div key={index}><p>{value instanceof SerializableAssignment ? "true" + JSON.stringify(value.fullJSON()) : JSON.stringify(value)}</p></div>)}*/}
        </Fragment>
    );
}
