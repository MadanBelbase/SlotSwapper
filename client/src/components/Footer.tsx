import react from '@vitejs/plugin-react'

export const Footer = () => {
  return (
    <footer className="w-full bg-gray-800 text-white py-4 mt-auto">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} SlotSwapper. All rights reserved.</p>
      </div>
    </footer>
  );
}