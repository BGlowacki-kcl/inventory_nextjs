'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore, auth } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material";
import { query, collection, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

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
    const userQuery = query(collection(firestore, 'inventory'), where("uid", "==", uid))
    const docs = await getDocs(userQuery)
    const inventoryList = []
    docs.forEach((doc)=>{
      const data = doc.data();
      inventoryList.push({
        name: doc.id.replace(`${uid}_`, ''),
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item) =>{
    if(!userId) return;
    const docRef = doc(collection(firestore, 'inventory'), `${userId}_${item}`)
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
    const docRef = doc(collection(firestore, 'inventory'), `${userId}_${item}`)
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

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
  <Box 
    width = "100vw" 
    height="100vh" 
    display="flex" 
    flexDirection="column"
    justifyContent="center" 
    alignItems="center" 
    gap={2}
  >
    <Modal open={open} onClose={handleClose}>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width={400}
        bgcolor="white"
        border="2px solid black"
        boxShadow={24}
        p={4}
        display="flex"
        flexDirection="column"
        gap={3}
        sx={{
          transform: "translate(-50%, -50%)"
        }}
      >
        <Typography variant="h6">Add Item</Typography>
        <Stack width="100%" direction="row" spacing={2}>
          <TextField
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e)=>{
              setItemName(e.target.value)
            }}
          />
          <Button 
            variant="outlined" 
            onClick={()=>{
              addItem(itemName)
              setItemName("")
              handleClose()
            }}
          >
            Add
          </Button>
        </Stack>
      </Box>
    </Modal>
    <Button 
      variant="contained" 
      onClick={()=> {
        handleOpen()
      }}
    >
      Add new Item
    </Button>
    <Box border="1px solid #333">
      <Box 
        width="800px" 
        height="100px" 
        bgcolor="#ADD8E6" 
        alignItems="center" 
        justifyContent="center" 
        display="flex"
      >
        <Typography variant="h2" color="#333">
          Inventory Items
        </Typography>
      </Box>

      <Stack
        width="800px"
        height="300px"
        spacing={2}
        overflow="auto"
      >
      {inventory.map(({name, quantity})=>(
          <Box 
            key={name} 
            width="100%" 
            minHeight="150px" 
            display="flex"
            alignItems="center" 
            justifyContent="space-between" 
            bgColor="#f0f0f0"
            padding={5}
          >
            <Typography variant="h3" color="#333" textAlign="center">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>

            <Typography variant="h3" color="#333" textAlign="center">
              {quantity}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                onClick={()=>{
                  addItem(name)
                }}
              >
                Add
              </Button>
              <Button 
                variant="contained" 
                onClick={()=>{
                  removeItem(name)
                }}
              >
                Remove
              </Button>
            </Stack>
          </Box>
      ))}
      </Stack>
    </Box>
  </Box>
  );
}
