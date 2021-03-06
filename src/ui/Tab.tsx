import React, {useContext} from "react";
import {TabContext} from "./Tabbed";
import styled from "styled-components";

export const TextTabIcon = styled.b`
    color: ${({theme}) => theme.color.primary};
  margin-right: 2px;
`

const LeftSection = styled.section`
  text-align: start;
  padding: 0;
`

export default function Tab(props: { tabName: string, children: React.ReactNode }) {
    const activeTabName = useContext(TabContext)

    return (
        <LeftSection>
            {props.tabName === activeTabName ?
                props.children : null
            }
        </LeftSection>
    );
}
