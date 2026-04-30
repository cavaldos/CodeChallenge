import React from 'react';

const HomePage: React.FC = () => {
  return (
    <section className="home-page">
      <div className="card p-7 md:p-9">
        <span className=" inline-flex rounded-full px-3 py-1 text-sm font-medium">primary</span>
        <h1 className="mt-4">Welcome to the Home Page</h1>
        <p className="text-muted">This interface now uses a reusable pastel-themed semantic token system.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="badge-success rounded-full px-3 py-1 text-sm">success</span>
          <span className="badge-warning rounded-full px-3 py-1 text-sm">warning</span>
          <span className="badge-error rounded-full px-3 py-1 text-sm">error</span>
          <span className="badge-primary rounded-full px-3 py-1 text-sm">secondary surfaces</span>
        </div>
      </div>
    </section>
  );
};

export default HomePage;