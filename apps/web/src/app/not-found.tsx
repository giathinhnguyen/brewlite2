import Link from 'next/link';
export default function NotFound() { return <main className="p-12 text-center"><h1 className="text-3xl">Không tìm thấy trang</h1><Link href="/" className="mt-6 inline-block underline">Về trang chủ</Link></main>; }
