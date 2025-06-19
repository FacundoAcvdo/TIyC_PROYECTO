import React, { useState } from 'react'
import { Box, FileUpload, Icon, Flex, Center, Button, Container } from "@chakra-ui/react"
import { LuUpload } from "react-icons/lu"

function Comparador() {
  const [comparados, setComparados] = useState(false)
  const [content_1, setContent_1] = useState(undefined)
  const [content_2, setContent_2] = useState(undefined)

  const fileReader_1 = new FileReader();
  const fileReader_2 = new FileReader();

  fileReader_1.onload = (event) => {
    const text = event.target.result;
    setContent_1(text)
  };

  fileReader_2.onload = (event) => {
    const text = event.target.result;
    setContent_2(text)
  };

  const cargarArchivo = (archivos, id) => {
    if (id == 1) {
        fileReader_1.readAsText(archivos.files[0])
    }else {
        fileReader_2.readAsText(archivos.files[0])
    }
  }

    return (
    <>
    {!comparados && <Center width="100%" height="90vh">
        <Flex flexDirection="column" gap="5vw">
            <Flex flexDirection="row" >
                <FileUpload.Root w="xl" maxW="xl" alignItems="stretch" maxFiles={1} accept={"text/*"} onFileAccept={(archivos) =>{ cargarArchivo(archivos, 1)}} className='item'>
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

                <FileUpload.Root w="xl" maxW="xl" alignItems="stretch" maxFiles={1} accept={"text/*"} onFileAccept={(archivos) =>{ cargarArchivo(archivos, 2)}} className='item'>
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
            </Flex>
            <Center width="100%"><Button width="100px" onClick={() => {setComparados(true)}}>Comparar</Button></Center>
        </Flex>
    </Center>}

    {comparados && <Center width="100%" height="90vh">
        <Flex flexDirection="column" gap="6vh">
            <Flex>
                <Container width="40vw" height="65vh" overflow="auto" textWrap="wrap" textAlign="justify">
                     {Array.from({ length: Math.max(content_1.length, content_2.length) }).map((_, i) => {
                        const charOriginal = content_1[i] || "";
                        const charModified = content_2[i] || "";
                        const isDifferent = charOriginal !== charModified;

                        return (
                        <span
                            key={i}
                            style={{
                            backgroundColor: isDifferent ? "#c3d48b" : "transparent",
                            }}
                        > 
                            {charOriginal}
                        </span>
                        );
                    })}
                </Container>

                <Container width="40vw" height="65vh" overflow="auto" textWrap="wrap" textAlign="justify">
                    {Array.from({ length: Math.max(content_1.length, content_2.length) }).map((_, i) => {
                        const charOriginal = content_1[i] || "";
                        const charModified = content_2[i] || "";
                        const isDifferent = charOriginal !== charModified;

                        return (
                        <span
                            key={i}
                            style={{
                            backgroundColor: isDifferent ? "salmon" : "transparent",
                            }}
                        > 
                            {charModified}
                        </span>
                        );
                    })}
                </Container>
            </Flex>
            <Center width="100%"><Button width="100px" onClick={() => {setComparados(false)}}>Volver</Button></Center>
        </Flex>
    </Center> }
    </>
  )
}

export default Comparador