import { AiFillGithub, AiFillInstagram } from 'react-icons/ai';
import { FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { RiMailFill } from 'react-icons/ri';
import {
  SanitizedGithub,
  SanitizedSocial,
} from '../../interfaces/sanitized-config';
import { skeleton } from '../../utils';

const Footer = ({
  content,
  loading,
  social,
  github,
}: {
  content: string | null;
  loading: boolean;
  social: SanitizedSocial;
  github: SanitizedGithub;
}) => {
  if (!content) return null;

  return (
    <div className="card-body">
      {loading ? (
        skeleton({ widthCls: 'w-52', heightCls: 'h-6' })
      ) : (
        <>
          <div dangerouslySetInnerHTML={{ __html: content }} />
          <nav
            aria-label="Social links"
            className="flex flex-wrap justify-center gap-2"
          >
            {social.linkedin && (
              <a
                aria-label="LinkedIn"
                className="btn btn-ghost btn-circle"
                href={`https://www.linkedin.com/in/${social.linkedin}`}
                rel="noopener noreferrer"
                target="_blank"
                title="LinkedIn"
              >
                <FaLinkedin aria-hidden="true" size={20} />
              </a>
            )}
            {social.instagram && (
              <a
                aria-label="Instagram"
                className="btn btn-ghost btn-circle"
                href={`https://www.instagram.com/${social.instagram}/?hl=en`}
                rel="noopener noreferrer"
                target="_blank"
                title="Instagram"
              >
                <AiFillInstagram aria-hidden="true" size={20} />
              </a>
            )}
            {social.phone && (
              <a
                aria-label="WhatsApp"
                className="btn btn-ghost btn-circle"
                href={`https://wa.me/${social.phone.replace(/\D/g, '')}`}
                rel="noopener noreferrer"
                target="_blank"
                title="WhatsApp"
              >
                <FaWhatsapp aria-hidden="true" size={20} />
              </a>
            )}
            {social.facebook && (
              <a
                aria-label="Facebook"
                className="btn btn-ghost btn-circle"
                href={`https://www.facebook.com/${social.facebook}`}
                rel="noopener noreferrer"
                target="_blank"
                title="Facebook"
              >
                <FaFacebook aria-hidden="true" size={20} />
              </a>
            )}
            <a
              aria-label="GitHub"
              className="btn btn-ghost btn-circle"
              href={`https://github.com/${github.username}`}
              rel="noopener noreferrer"
              target="_blank"
              title="GitHub"
            >
              <AiFillGithub aria-hidden="true" size={20} />
            </a>
            {social.email && (
              <a
                aria-label="Email"
                className="btn btn-ghost btn-circle"
                href={`mailto:${social.email}`}
                title="Email"
              >
                <RiMailFill aria-hidden="true" size={20} />
              </a>
            )}
          </nav>
        </>
      )}
    </div>
  );
};

export default Footer;
