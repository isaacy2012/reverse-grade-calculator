import styled from "styled-components";
import React, {useEffect, useState} from "react";
import {Assignment, numOrPercToBd} from "../model/Assignment";
import {Score} from "../model/Score";
import {SpacerDiv} from "./SpacerDiv";
import {FlexChild6, FlexDiv} from "./Flex";
import {InputChangeEvent, StyledInput} from "./StyledInput";
import { IconButton } from "./IconButton";
import { IoCloseOutline, IoDuplicateSharp } from "react-icons/io5";
import {bd} from "../model/Result";

const FirstContentCol = styled.p`
  text-align: start;
  flex: 3;
`
const ContentCol = styled.p`
  text-align: start;
  flex: 1.5;
`

const LastContentCol = styled.p`
  text-align: end;
  flex: 1.5;
`

const ContentRowContainer = styled.div`
  display: flex;
  flex-direction: row;
`

const ContentUnderline = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 1px;
  background: ${({theme}) => theme.color.contentUnderline};
`

const Input = styled(StyledInput).attrs((props: { accepted: boolean, empty: boolean, shouldUnderline: boolean }) => ({
    accepted: props.accepted,
    empty: props.empty,
    shouldUnderline: props.shouldUnderline,
}))`
  font-size: 1em;
  color: ${({empty, accepted, theme}) => empty || accepted ? theme.color.text : theme.color.outlineReject};
  font-weight: ${({empty, accepted}) => empty || accepted ? "normal" : "bold"};
  width: 100%;
  text-decoration: ${({empty, shouldUnderline}) => empty && shouldUnderline ? "underline" : "none"};
`

const RightInput = styled(Input)`
  text-align: right;
`

export default function ContentRow(
    props: {
        assignment: Assignment,
        onChange: (assignment: Assignment) => void,
        onClick?: () => void
        onDuplicate?: () => void
        onDelete?: () => void
    }
) {
    const {onChange, assignment, onClick} = props;
    const assignmentUUID = assignment.uuid;

    const [nameStr, setNameStr] = useState<string>(assignment.getNameStr());
    const [scoreStr, setScoreStr] = useState<string>(assignment.getScoreStr());
    const [weightStr, setWeightStr] = useState<string>(assignment.getWeightStr());

    useEffect(() => {
        if (onClick === undefined) {
            let strAssignment = Assignment.fromStrings(nameStr, scoreStr, weightStr, assignmentUUID);
            onChange(strAssignment);
        }
    }, [onClick, nameStr, scoreStr, weightStr, onChange, assignmentUUID])

    function weightStrValid(): boolean {
        let weight = numOrPercToBd(weightStr);
        if (weight == null) {
            return false;
        }
        return weight.compareTo(bd("1")) < 1
    }

    return (
        <FlexDiv>
            <SpacerDiv>
                {props.onClick === undefined &&
                // ×
                <IconButton fontSize="1.1em" onClick={props.onDuplicate} tabIndex={-1}><IoDuplicateSharp/></IconButton>}
            </SpacerDiv>
            <FlexChild6>
                <ContentRowContainer onClick={props.onClick}>
                    <FirstContentCol>
                        <Input
                            value={nameStr}
                            placeholder={"Title"}
                            accepted={nameStr !== ""}
                            onFocus={props.onClick}
                            empty={nameStr.length === 0}
                            shouldUnderline={props.onClick === undefined}
                            onChange={(event: InputChangeEvent) => setNameStr(event.target.value)}
                        />
                    </FirstContentCol>
                    <ContentCol>
                        <Input
                            value={weightStr}
                            placeholder={"Overall Weight"}
                            accepted={weightStrValid()}
                            onFocus={props.onClick}
                            empty={weightStr.length === 0}
                            shouldUnderline={props.onClick === undefined}
                            onChange={(event: InputChangeEvent) => setWeightStr(event.target.value.trim())}
                        />
                    </ContentCol>
                    <LastContentCol>
                        <RightInput
                            value={scoreStr}
                            placeholder={"Score Achieved"}
                            accepted={Score.fromString(scoreStr) !== null}
                            onFocus={props.onClick}
                            empty={scoreStr.length === 0}
                            shouldUnderline={props.onClick === undefined}
                            onChange={(event: InputChangeEvent) => setScoreStr(event.target.value.trim())}
                        />
                    </LastContentCol>
                </ContentRowContainer>
                <ContentUnderline/>
            </FlexChild6>
            <SpacerDiv>
                {props.onClick === undefined &&
                // ×
                <IconButton onClick={props.onDelete} tabIndex={-1}><IoCloseOutline/></IconButton>}
            </SpacerDiv>
        </FlexDiv>
    );
}
