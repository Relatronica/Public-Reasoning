# Immagini delle community

Ogni community può avere logo e banner nella sidebar destra.

## Convenzione

Per lo slug `weltform`, metti i file qui:

```
public/communities/weltform/logo.svg   (quadrato, consigliato 64×64 o più)
public/communities/weltform/cover.svg  (banner, consigliato 288×96 o ratio ~3:1)
```

Formati supportati: SVG, PNG, JPG, WebP.

## Override nel pack

In `lib/communities.ts` puoi anche indicare URL diversi:

```ts
logoUrl: '/communities/weltform/logo.png',
coverImageUrl: 'https://esempio.it/banner.jpg',
```

Se `logoUrl` manca, la UI mostra le iniziali della community.
