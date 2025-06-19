import React from 'react'
import { useState } from 'react'
import { Box, FileUpload, Alert , Icon, Button, Portal, Select, createListCollection } from "@chakra-ui/react"
import { LuUpload } from "react-icons/lu"
import "./Hamming.css"

const url_hamming = import.meta.env.VITE_HAMMING_URL;

function Hamming() {
  const [accepted, setAccepted] = useState(undefined)
  const [tamBloque, setTamBloque] = useState(8)
  const [result, setResult] = useState(undefined)
  const [hayArchivo, setHayArchivo] = useState(true)
  const [cantErrores, setCantErrores] = useState(0)
  const [nombreArchivo, setNombreArchivo] = useState("")
  const [hayResultado, setHayResultado] = useState(false)


  const frameworks = createListCollection({
    items: [
      { label: "8 bits", value: "8" },
      { label: "256 bits", value: "256" },
      { label: "4096 bits", value: "4096" },
    ],
  })

  const cantidadDeErrores = createListCollection({
    items: [
      { label: "Sin errores", value: "0" },
      { label: "1 Error por bloque", value: "1" },
      { label: "2 Errores por bloque", value: "2" }
    ],
  })

  const handleHamming = async () => {
    setHayArchivo(true)

    if (accepted == undefined) {
      setHayArchivo(false)
      return
    }

    if (cantErrores == 0){
      switch (tamBloque) {
        case 8:
          setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_hamming.HA1")
        break
        case 256:
          setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_hamming.HA2")
        break
        default:
          setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_hamming.HA3")
        break
      }
    }else{
      switch (tamBloque) {
        case 8:
          setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_hamming.HE1")
        break
        case 256:
          setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_hamming.HE2")
        break
        default:
          setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_hamming.HE3")
        break
      }
    }

    const formData = new FormData();
    formData.append("file", accepted);
    formData.append("tamBloque", tamBloque)
    formData.append("cantErrores", cantErrores)
  
    const res = await fetch(url_hamming, {
      method: "POST",
      body: formData,
    });
  
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    setResult(url)
    setHayResultado(true)
  }

  const cargarArchivo = (archivos) => {
    setAccepted(archivos.files[0])
    setNombreArchivo("")
    setResult(undefined)
    setHayResultado(false)
  }

  return (
        <div className='contenedor'>
        <FileUpload.Root maxW="xl" alignItems="stretch" maxFiles={1} accept={"text/*"} onFileAccept={(archivos) =>{ cargarArchivo(archivos)}} className='item'>
          <FileUpload.HiddenInput />
          <FileUpload.Dropzone>
            <Icon size="md" color="fg.muted">
              <LuUpload />
            </Icon>
            <FileUpload.DropzoneContent>
              <Box>Arrastra y suelta los archivos aqui</Box>
              <Box color="fg.muted">.txt</Box>
            </FileUpload.DropzoneContent>
          </FileUpload.Dropzone>
          <FileUpload.List />
        </FileUpload.Root>
    
      <div className='botones'>
      <Select.Root collection={frameworks} size="sm" width="200px" onValueChange={(e) => setTamBloque(parseInt(e.value[0]))} className='item'>
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Tamaño del bloque" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {frameworks.items.map((framework) => (
                  <Select.Item item={framework} key={framework.value}>
                    {framework.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>

        <Select.Root collection={cantidadDeErrores} size="sm" width="200px" onValueChange={(e) => setCantErrores(parseInt(e.value[0]))} className='item'>
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Errores por bloque" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {cantidadDeErrores.items.map((cantidadDeErrores) => (
                  <Select.Item item={cantidadDeErrores} key={cantidadDeErrores.value}>
                    {cantidadDeErrores.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </div>

        <div className='botones'>
          <Button variant="surface" onClick={handleHamming} className='item' >Codificar</Button> 
          {result != undefined && 
            <Button variant="surface" className='item' onClick={() => setHayResultado(false)}>
              <a href={result} download={nombreArchivo}>Descargar</a>
            </Button>
          }
        </div>

        {!hayArchivo && <Alert.Root status="error" className='item alerta'>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Falta cargar archivo</Alert.Title>
              <Alert.Description>
                Se debe cargar un archivo para aplicar la codificación
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>}

        {hayResultado && <Alert.Root status="success" className='item alerta'>
          <Alert.Indicator />
          <Alert.Title>Archivo codificado con éxito</Alert.Title>
        </Alert.Root>
        }
        </div>
  )
}

export default Hamming