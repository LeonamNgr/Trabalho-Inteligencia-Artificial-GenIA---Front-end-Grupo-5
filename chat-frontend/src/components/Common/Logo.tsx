import { useState } from 'react';

export function Logo() {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <h1 className="marvel-title text-[#ED1D24] text-xl font-bold tracking-[0.2em] uppercase select-none">
        MARVEL
      </h1>
    );
  }

  return (
    <h1 className="marvel-title select-none">
      <img
        src="/Marvel_Logo.jpg"
        alt="Marvel"
        className="marvel-logo-img"
        onError={() => setImgError(true)}
      />
    </h1>
  );
}
