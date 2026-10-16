import { describe, it, expect } from 'vitest';
import { getKindInfo, getKindsForNip, getNipInfo } from './kindInfo';

describe('getNipInfo', () => {
  it('knows NIPs added to the official list', () => {
    expect(getNipInfo('CC')).toMatchObject({ name: 'Geocaching', link: 'https://github.com/nostr-protocol/nips/blob/master/CC.md' });
    expect(getNipInfo('f4')?.name).toBe('Podcasts');
    expect(getNipInfo('NIP-67')?.name).toBe('EOSE Completeness Hint');
    expect(getNipInfo('8')?.name).toBe('Handling Mentions');
  });

  it('uses the current official names', () => {
    expect(getNipInfo('39')?.name).toBe('Linking Profiles to Other Platforms');
    expect(getNipInfo('5A')?.name).toBe('Static Websites (nsites)');
  });

  it('returns null for unknown NIPs', () => {
    expect(getNipInfo('ZZ')).toBeNull();
  });
});

describe('getKindInfo', () => {
  it('knows kinds added to the official list', () => {
    expect(getKindInfo(54)).toMatchObject({ nip: 'NIP-F4', description: 'Podcast Episode' });
    expect(getKindInfo(21059)).toMatchObject({ nip: 'NIP-59', description: 'Ephemeral Gift Wrap', classification: 'ephemeral' });
    expect(getKindInfo(38000)).toMatchObject({ nip: 'NIP-87', classification: 'addressable' });
  });

  it('links kinds whose spec became an official NIP', () => {
    expect(getKindInfo(37516)).toMatchObject({ nip: 'NIP-CC', link: 'https://github.com/nostr-protocol/nips/blob/master/CC.md' });
    expect(getKindInfo(24242)).toMatchObject({ nip: 'NIP-B7', link: 'https://github.com/nostr-protocol/nips/blob/master/B7.md' });
  });
});

describe('kinds from the kinds registry', () => {
  const REGISTRY = 'https://github.com/nostr-protocol/registry-of-kinds/blob/master/schema.yaml';

  it('describes kinds that have no NIP, linking to the registry', () => {
    expect(getKindInfo(25050)).toMatchObject({ nip: '', description: 'Call Offer', link: REGISTRY, classification: 'ephemeral' });
    expect(getKindInfo(1064)).toMatchObject({ nip: '', description: 'Blob Data (NIP-95)', link: REGISTRY });
  });

  it('prefers a registry kind over the NIP-90 job range it falls in', () => {
    expect(getKindInfo(5129)).toMatchObject({ nip: '', description: 'Napplet Snapshot', link: REGISTRY });
    expect(getKindInfo(6969)).toMatchObject({ nip: '', description: 'Zap Poll', link: REGISTRY });
    expect(getKindInfo(6969)).not.toHaveProperty('unrecommended');
  });

  it('links a registry kind to its NIP or spec when the registry names one', () => {
    expect(getKindInfo(30385)).toMatchObject({ nip: 'NIP-85', description: 'External ID Assertion' });
    expect(getKindInfo(36820)).toMatchObject({ nip: 'Hitchhiking Data Standard', description: 'Hitchhiking Ride', link: 'https://github.com/Hitchwiki/hitchhiking-data-standard' });
  });
});

describe('NIP-29 group kinds', () => {
  it('names each group kind, falling back to the range for unnamed ones', () => {
    expect(getKindInfo(9007)).toMatchObject({ nip: 'NIP-29', description: 'Create Group' });
    expect(getKindInfo(39001)).toMatchObject({ nip: 'NIP-29', description: 'Group Admins', classification: 'addressable' });
    expect(getKindInfo(9003)).toMatchObject({ nip: 'NIP-29', description: 'Group Control Events' });
    expect(getKindsForNip('29').filter(k => k === 9000)).toHaveLength(1);
  });
});

describe('Mostro kinds', () => {
  it('describes every Mostro kind, linking to the Mostro protocol docs', () => {
    expect(getKindInfo(38389)).toMatchObject({ nip: 'Mostro', description: 'Mostro health', link: 'https://mostro.network/protocol/health_event.html', classification: 'addressable' });
    expect(getKindsForNip('Mostro')).toEqual([38384, 38385, 38386, 38387, 38388, 38389]);
    expect(getKindInfo(38383).nip).toBe('NIP-69');
  });
});

describe('getKindsForNip', () => {
  it('finds the kinds of a new NIP', () => {
    expect(getKindsForNip('CC')).toEqual([7516, 7517, 37516, 37517]);
    expect(getKindsForNip('F4')).toEqual([54, 10154]);
  });
});

describe('unrecommended NIPs', () => {
  it('gives the reason from the NIPs repository', () => {
    expect(getNipInfo('04')?.unrecommended).toBe('deprecated in favor of NIP-17');
    expect(getNipInfo('EE')?.unrecommended).toBe('superseded by the Marmot Protocol');
    expect(getNipInfo('01')).not.toHaveProperty('unrecommended');
  });

  it('flags kinds whose NIP is unrecommended, including kind ranges', () => {
    expect(getKindInfo(4).unrecommended).toBe('deprecated in favor of NIP-17');
    expect(getKindInfo(5100)).toMatchObject({ nip: 'NIP-90', unrecommended: expect.stringContaining('microstandards') });
    expect(getKindInfo(1)).not.toHaveProperty('unrecommended');
    expect(getKindInfo(25050)).not.toHaveProperty('unrecommended');
  });
});
