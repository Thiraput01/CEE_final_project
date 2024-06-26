import { BACKEND_URL } from "./config.js";

//------------------------Room--------------------------

export async function createRoom(room) {
  const response = await fetch(`${BACKEND_URL}/api/room`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(room),
  }).then((r) => r.json());
  return response;
}

export async function getAllRooms() {
  const rooms = await fetch(`${BACKEND_URL}/api/room`).then((r) => r.json());
  return rooms;
}

export async function getAllRoomNumber() {
  const roomNumbers = await fetch(`${BACKEND_URL}/api/room/number`).then((r) =>
    r.json()
  );
  return roomNumbers;
}

export async function getRoomById(id) {
  const room = await fetch(`${BACKEND_URL}/api/room/${id}`).then((r) =>
    r.json()
  );
  return room;
}

export async function deleteRoomById(id) {
  await fetch(`${BACKEND_URL}/api/room/${id}`, {
    method: "DELETE",
  });
}

//------------------------PlayerController--------------------------

export async function createPlayerControl(instance) {
  const response = await fetch(`${BACKEND_URL}/api/playerControl/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(instance),
  }).then((r) => r.json());
  return response;
}

export async function getPlayerControlbyId(id) {
  const instance = await fetch(
    `${BACKEND_URL}/api/playerControl/getPlayerById?playerId=${id}`
  ).then((r) => r.json());
  return instance;
}

export async function getAllPlayerControl() {
  const instances = await fetch(`${BACKEND_URL}/api/playerControl/`).then((r) =>
    r.json()
  );
  return instances;
}

export async function updatePlayerControlbyId(id, instance) {
  await fetch(
    `${BACKEND_URL}/api/playerControl/upDatePlayerById?playerId=${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(instance),
    }
  );
}

//--------------------Instance------------------------------

export async function createInstance(id, instance) {
  await fetch(`${BACKEND_URL}/api/room/instanceCreate/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(instance),
  });
}

export async function updateInstance(id, instance) {
  await fetch(`${BACKEND_URL}/api/room/instanceUpdate/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(instance),
  });
}

export async function getInstance(roomId, playerId) {
  const instance = await fetch(
    `${BACKEND_URL}/api/room/instanceGet/${roomId}?player=${playerId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return instance.json();
}

export async function deleteInstance(id, instance) {
  await fetch(`${BACKEND_URL}/api/room/instanceDelete/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(instance),
  });
}

//-------------------------User---------------------------------------------

export async function getUsers() {
  const users = await fetch(`${BACKEND_URL}/api/user`).then((r) => r.json());
  return users;
}

export async function createUser(user) {
  const response = await fetch(`${BACKEND_URL}/api/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  }).then((r) => r.json());
  return response;
}

export async function getUserById(id) {
  const user = await fetch(`${BACKEND_URL}/api/user/${id}`).then((r) =>
    r.json()
  );
  return user;
}
