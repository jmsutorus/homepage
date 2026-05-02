
import { query } from "@/lib/db";
import Link from "next/link";

export default async function UPage() {
    const users = await query<any>("SELECT name, public_slug FROM user WHERE public_slug IS NOT NULL");
    
    return (
        <div style={{ padding: '20px' }}>
            <h1>Public Profiles</h1>
            <ul>
                {users.map(u => (
                    <li key={u.public_slug}>
                        <Link href={`/u/${u.public_slug}`}>{u.name || u.public_slug}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
