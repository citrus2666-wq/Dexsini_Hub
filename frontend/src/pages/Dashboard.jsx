import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api.get("/users/")
            .then((res) => setUsers(res.data))
            .catch(() => alert("Unauthorized"));
    }, []);

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Dashboard</h2>
            <pre>{JSON.stringify(users, null, 2)}</pre>
        </div>
    );
}
