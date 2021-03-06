import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';
import { BioQuery } from '../types/queries';
import Spacer from './spacer';

const Bio: React.FC = () => {
  const data: BioQuery = useStaticQuery(graphql`
    query Bio {
      site {
        siteMetadata {
          author {
            name
            summary
          }
        }
      }
    }
  `);

  const author = data.site?.siteMetadata?.author;

  return (
    <>
      <Spacer />
      <div className="bio">
        <StaticImage
          className="bio-avatar"
          formats={['auto', 'webp', 'avif']}
          src="../images/profile-pic.jpeg"
          layout={'fixed'}
          width={150}
          height={140}
          quality={100}
          alt="Profile picture"
        />
        <div style={{ margin: '2rem' }}>
          {author?.name && (
            <p>
              Written by <strong>{author.name}</strong>{' '}
              {author?.summary || null}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Bio;
