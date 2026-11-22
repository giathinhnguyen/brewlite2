"use client";
export default function ErrorPage({reset}: {reset: () => void}) { return <main className="p-12 text-center"><h1 className="text-2xl">Chưa thể tải trang</h1><button onClick={reset} className="mt-6 underline">Thử lại</button></main>; }
