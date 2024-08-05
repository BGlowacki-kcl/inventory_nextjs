'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore, auth } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button, AppBar, Toolbar, Container } from "@mui/material";
import { query, collection, getDocs, deleteDoc, doc, getDoc, setDoc, where } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import '@/app/globals.css';



export default function Home() {

  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    signInAnonymously(auth)
      .then((userCredential) => {
        const uid = userCredential.user.uid;
        setUserId(uid);
        console.log('Signed in anonymously with UID:', uid);
        updateInventory(uid);
      })
      .catch((error) => {
        console.error('Error signing in anonymously:', error.code, error.message);
      });
  }, [])

  const updateInventory = async (uid) => {
    if(!uid) return;
    console.log('Fetching inventory for UID:', uid);
    const userQuery = query(collection(firestore, 'inventory'), where("uid", "==", uid))
    const docs = await getDocs(userQuery)
    const inventoryList = []
    docs.forEach((doc)=>{
      const data = doc.data();
      console.log('Fetched item:', data);
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item) =>{
    if(!userId) return;
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
        const {quantity} = docSnap.data()
        await setDoc(docRef, {quantity: quantity + 1}, {merge: true})
      } else {
        await setDoc(docRef, {quantity: 1, uid: userId})
      }
    await updateInventory(userId)
  }

  const removeItem = async (item) =>{
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      if(quantity==1){
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1}, {merge: true})
      }
    }
    await updateInventory(userId)
  }

  const removeAll = async (item) =>{
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      await deleteDoc(docRef)
    }
    await updateInventory(userId)
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <ThemeProvider theme={theme}>
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
    >
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className="text-3xl font-bold underline">
            Inventory Management
          </Typography>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="md"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          py: 3,
        }}
      >
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="background.paper"
            border="2px solid #000"
            boxShadow={24}
            className="animate-fade"
            p={4}
            sx={{ transform: 'translate(-50%, -50%)' }}
          >
            <Typography variant="h6" gutterBottom>
              Add Item
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Button variant="contained" onClick={handleOpen} className="animate-bounce">
          Add new Item
        </Button>
        <Box width="100%" p={2} bgcolor="background.paper" boxShadow={1}>
          <Typography variant="h2" gutterBottom>
            Inventory Items
          </Typography>
          <Stack spacing={2} maxHeight="35vh" overflow="auto">
            {inventory.map(({ name, quantity }) => (
              <Box
                key={name}
                p={2}
                bgcolor="background.default"
                borderRadius={1}
                boxShadow={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                className="animate-fade"
              >
                <Typography variant="h3">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h3">
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={() => addItem(name)}>
                    +
                  </Button>
                  <Button variant="contained" onClick={() => removeItem(name)}>
                    -
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => removeAll(name)}>
                    Bin
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Container>
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper',
          textAlign: 'center',
        }}
      >
        Site made by: Bartosz Glowacki
      </Box>
    </Box>
  </ThemeProvider>
  );
}
