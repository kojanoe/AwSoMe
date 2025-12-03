export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="mb-2 font-medium">
          Built with Next.js and Tailwind CSS
        </p>
        <p className="text-sm opacity-80">
          Your data is processed locally. No information is stored or sent to any server.
        </p>
      </div>
    </footer>
  );
}