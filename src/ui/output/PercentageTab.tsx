import React, {Fragment} from "react";
import {H3, H3First} from "./H3";
import styled from "styled-components";
import {InputChangeEvent} from "../StyledInput";
import AutosizeInput from "react-input-autosize";
import {OkPercentageResult, PercentageResult} from "../../model/PercentageResult";
import {DEFAULT_OUT_OF} from "../../util/Constants";


const Display = styled.span.attrs((props: { marginRight?: string }) => ({
    marginRight: props.marginRight,
}))`
  margin-right: ${({marginRight}) => marginRight ? marginRight : undefined};
  color: ${({theme}) => theme.color.text};
  font-weight: 500;
  font-size: 3rem;
`
const Hi = styled.span.attrs((props: { enabled: boolean }) => ({
    enabled: props.enabled,
}))`
  color: ${({enabled, theme}) => enabled ? theme.color.highlight : theme.color.utilityText};
`

const UtilityText = styled.span`
  color: ${({theme}) => theme.color.utilityText};
`

const Or = styled.b`
  white-space: pre;
`

type State<T> = [T, React.Dispatch<React.SetStateAction<T>>]


export default function PercentageTab(props: { result: PercentageResult, threshState: State<string>, outOfState: State<string> }) {
    const result = props.result;
    const [threshStr, setThreshStr] = props.threshState;
    const [outOfStr, setOutOfStr] = props.outOfState;

    return (
        <Fragment>
            <H3First>Desired Percentage</H3First>
            <UtilityText>
                <AutosizeInput value={threshStr}
                               maxLength={4}
                               inputStyle = {{
                                   fontSize: "3rem",
                                   fontWeight: 500,
                                   border: "none",
                               }}
                               type="numeric"
                               placeholder="--"
                               onChange={(event: InputChangeEvent) =>
                                   setThreshStr(event.target.value.trim())
                               }
                />
                %
            </UtilityText>
            <H3>Required Result</H3>
            {result.message()}
            {result instanceof OkPercentageResult &&
            <span>
                <Display marginRight="2px"><Hi
                    enabled={result.isValid()}>{result.requiredPercentageStr()}</Hi></Display><UtilityText>%</UtilityText>
                <Or>  or  </Or>
                <Display><Hi enabled={result.isValid()}>{result.requiredAchievedStr()}</Hi><UtilityText>/</UtilityText></Display>
                <AutosizeInput value={outOfStr}
                               inputStyle = {{
                                   fontSize: "3rem",
                                   fontWeight: 500,
                                   border: "none",
                               }}
                               maxLength={5}
                               type="numeric"
                               placeholder={DEFAULT_OUT_OF.toString()}
                               onChange={(event: InputChangeEvent) =>
                                   setOutOfStr(event.target.value.trim())
                               }/>
            </span>
            }
        </Fragment>
    );
}
