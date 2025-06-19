import { Tabs } from "@chakra-ui/react"
import { useState } from "react"
import Hamming from './Hamming.jsx'
import Traducir from "./Traducir.jsx"
import Huffman from "./Huffman.jsx"
import Comparador from "./Comparador.jsx"
import "./App.css"

function App() {
  const [tab, setTab] = useState("H")

  return (
    <div >
      <Tabs.Root lazyMount unmountOnExit defaultValue="tab-1" className="tabs" onValueChange={(d)=>setTab(d.value)}>
        <Tabs.List>
          <Tabs.Trigger value="H">Hamming</Tabs.Trigger>
          <Tabs.Trigger value="T">Traducir</Tabs.Trigger>
          <Tabs.Trigger value="Hu">Huffman</Tabs.Trigger>
          <Tabs.Trigger value="C">Comparador</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      { tab == "H" && <Hamming/> } 
      { tab == "T" && <Traducir/> } 
      { tab == "Hu" && <Huffman/> } 
      { tab == "C" && <Comparador/> } 
    </div>
  )
}

export default App
