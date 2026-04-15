/**
 * Lightweight Bootstrap 3 component wrappers.
 * Drop-in replacement for react-bootstrap imports so existing pages
 * work with the Bootstrap 3 CSS already loaded via the old platform styles.
 */
'use client';

import React from 'react';

// ---- Layout ----
export function Container({ children, fluid, className = '', ...props }: any) {
  return <div className={`${fluid ? 'container-fluid' : 'container'} ${className}`} {...props}>{children}</div>;
}

export function Row({ children, className = '', ...props }: any) {
  return <div className={`row ${className}`} {...props}>{children}</div>;
}

export function Col({ children, xs, sm, md, lg, className = '', ...props }: any) {
  const classes: string[] = [];
  if (xs) classes.push(`col-xs-${xs}`);
  if (sm) classes.push(`col-sm-${sm}`);
  if (md) classes.push(`col-md-${md}`);
  if (lg) classes.push(`col-lg-${lg}`);
  if (classes.length === 0) classes.push('col-xs-12');
  return <div className={`${classes.join(' ')} ${className}`} {...props}>{children}</div>;
}

// ---- Button ----
export function Button({ children, variant = 'default', size, className = '', onClick, href, type = 'button', disabled, ...props }: any) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : size === 'xs' ? 'btn-xs' : '';
  const cls = `btn btn-${variant} ${sizeClass} ${className}`.trim();
  if (href) {
    return <a href={href} className={cls} {...props}>{children}</a>;
  }
  return <button type={type} className={cls} onClick={onClick} disabled={disabled} {...props}>{children}</button>;
}

// ---- Table ----
export function Table({ children, striped, bordered, hover, responsive, size, className = '', ...props }: any) {
  const classes = ['table'];
  if (striped) classes.push('table-striped');
  if (bordered) classes.push('table-bordered');
  if (hover) classes.push('table-hover');
  if (size === 'sm') classes.push('table-condensed');
  classes.push(className);
  const table = <table className={classes.join(' ')} {...props}>{children}</table>;
  if (responsive) return <div className="table-responsive">{table}</div>;
  return table;
}

// ---- Alert ----
export function Alert({ children, variant = 'info', className = '', dismissible, onClose, ...props }: any) {
  return (
    <div className={`alert alert-${variant} ${dismissible ? 'alert-dismissible' : ''} ${className}`} role="alert" {...props}>
      {dismissible && <button type="button" className="close" onClick={onClose}><span>&times;</span></button>}
      {children}
    </div>
  );
}

// ---- Spinner ----
export function Spinner({ animation, size, className = '', ...props }: any) {
  return (
    <span className={`${className}`} {...props}>
      <i className="fa fa-spinner fa-spin" style={size === 'sm' ? { fontSize: '14px' } : { fontSize: '24px' }}></i>
    </span>
  );
}

// ---- Badge ----
export function Badge({ children, bg, variant, pill, className = '', ...props }: any) {
  const color = bg || variant || 'default';
  return <span className={`label label-${color} ${className}`} {...props}>{children}</span>;
}

// ---- Form ----
function FormControl({ type = 'text', as, className = '', ...props }: any) {
  const cls = `form-control ${className}`;
  if (as === 'textarea') return <textarea className={cls} {...props} />;
  if (as === 'select') return <select className={cls} {...props} />;
  return <input type={type} className={cls} {...props} />;
}

function FormGroup({ children, className = '', controlId, ...props }: any) {
  return <div className={`form-group ${className}`} {...props}>{children}</div>;
}

function FormLabel({ children, className = '', ...props }: any) {
  return <label className={`control-label ${className}`} {...props}>{children}</label>;
}

function FormCheck({ type = 'checkbox', label, checked, onChange, className = '', id, name, ...props }: any) {
  return (
    <div className={`${type === 'radio' ? 'radio' : 'checkbox'} ${className}`}>
      <label>
        <input type={type} checked={checked} onChange={onChange} id={id} name={name} {...props} />
        {label}
      </label>
    </div>
  );
}

function FormSelect({ children, className = '', ...props }: any) {
  return <select className={`form-control ${className}`} {...props}>{children}</select>;
}

function FormText({ children, className = '', ...props }: any) {
  return <span className={`help-block ${className}`} {...props}>{children}</span>;
}

export const Form = Object.assign(
  ({ children, className = '', onSubmit, ...props }: any) => (
    <form className={className} onSubmit={onSubmit} {...props}>{children}</form>
  ),
  {
    Control: FormControl,
    Group: FormGroup,
    Label: FormLabel,
    Check: FormCheck,
    Select: FormSelect,
    Text: FormText,
  }
);

// ---- Modal ----
export function Modal({ children, show, onHide, size, className = '', ...props }: any) {
  if (!show) return null;
  const sizeClass = size === 'lg' ? 'modal-lg' : size === 'sm' ? 'modal-sm' : '';
  return (
    <>
      <div className="modal-backdrop fade in" onClick={onHide}></div>
      <div className={`modal fade in ${className}`} style={{ display: 'block' }} role="dialog" {...props}>
        <div className={`modal-dialog ${sizeClass}`}>
          <div className="modal-content">{children}</div>
        </div>
      </div>
    </>
  );
}
Modal.Header = ({ children, closeButton, ...props }: any) => (
  <div className="modal-header" {...props}>
    {closeButton && <button type="button" className="close" data-dismiss="modal"><span>&times;</span></button>}
    {children}
  </div>
);
Modal.Title = ({ children, ...props }: any) => <h4 className="modal-title" {...props}>{children}</h4>;
Modal.Body = ({ children, ...props }: any) => <div className="modal-body" {...props}>{children}</div>;
Modal.Footer = ({ children, ...props }: any) => <div className="modal-footer" {...props}>{children}</div>;

// ---- Tabs / Tab ----
export function Tabs({ children, activeKey, onSelect, className = '', ...props }: any) {
  const tabs = React.Children.toArray(children);
  return (
    <div className={className} {...props}>
      <ul className="nav nav-tabs">
        {tabs.map((tab: any) => (
          <li key={tab.props.eventKey} className={activeKey === tab.props.eventKey ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); onSelect?.(tab.props.eventKey); }}>{tab.props.title}</a>
          </li>
        ))}
      </ul>
      <div className="tab-content" style={{ paddingTop: '15px' }}>
        {tabs.map((tab: any) => (
          <div key={tab.props.eventKey} className={`tab-pane ${activeKey === tab.props.eventKey ? 'active' : ''}`}>
            {activeKey === tab.props.eventKey && tab.props.children}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Tab({ children }: any) {
  return <>{children}</>;
}

// ---- Pagination ----
export function Pagination({ children, className = '', ...props }: any) {
  return <ul className={`pagination ${className}`} {...props}>{children}</ul>;
}
Pagination.Item = ({ children, active, onClick, ...props }: any) => (
  <li className={active ? 'active' : ''} {...props}><a href="#" onClick={(e) => { e.preventDefault(); onClick?.(); }}>{children}</a></li>
);
Pagination.Prev = ({ onClick, disabled, ...props }: any) => (
  <li className={disabled ? 'disabled' : ''} {...props}><a href="#" onClick={(e) => { e.preventDefault(); if (!disabled) onClick?.(); }}>&laquo;</a></li>
);
Pagination.Next = ({ onClick, disabled, ...props }: any) => (
  <li className={disabled ? 'disabled' : ''} {...props}><a href="#" onClick={(e) => { e.preventDefault(); if (!disabled) onClick?.(); }}>&raquo;</a></li>
);
Pagination.Ellipsis = (props: any) => <li className="disabled" {...props}><span>...</span></li>;

// ---- Card (maps to Bootstrap 3 panel) ----
export function Card({ children, className = '', ...props }: any) {
  return <div className={`panel panel-default ${className}`} {...props}>{children}</div>;
}
Card.Header = ({ children, ...props }: any) => <div className="panel-heading" {...props}>{children}</div>;
Card.Body = ({ children, ...props }: any) => <div className="panel-body" {...props}>{children}</div>;
Card.Footer = ({ children, ...props }: any) => <div className="panel-footer" {...props}>{children}</div>;
Card.Title = ({ children, ...props }: any) => <h3 className="panel-title" {...props}>{children}</h3>;

// ---- InputGroup ----
export function InputGroup({ children, className = '', ...props }: any) {
  return <div className={`input-group ${className}`} {...props}>{children}</div>;
}
InputGroup.Text = ({ children, ...props }: any) => <span className="input-group-addon" {...props}>{children}</span>;

// ---- Nav ----
export function Nav({ children, variant, className = '', ...props }: any) {
  const cls = variant === 'pills' ? 'nav-pills' : variant === 'tabs' ? 'nav-tabs' : '';
  return <ul className={`nav ${cls} ${className}`} {...props}>{children}</ul>;
}

// ---- Dropdown (simplified) ----
export function Dropdown({ children, className = '', ...props }: any) {
  return <div className={`dropdown ${className}`} {...props}>{children}</div>;
}
Dropdown.Toggle = ({ children, variant = 'default', ...props }: any) => (
  <button className={`btn btn-${variant} dropdown-toggle`} data-toggle="dropdown" {...props}>{children} <span className="caret"></span></button>
);
Dropdown.Menu = ({ children, ...props }: any) => <ul className="dropdown-menu" {...props}>{children}</ul>;
Dropdown.Item = ({ children, onClick, href, ...props }: any) => (
  <li {...props}><a href={href || '#'} onClick={onClick}>{children}</a></li>
);

// ---- ProgressBar ----
export function ProgressBar({ now = 0, variant = 'default', label, className = '', ...props }: any) {
  return (
    <div className={`progress ${className}`} {...props}>
      <div className={`progress-bar progress-bar-${variant}`} style={{ width: `${now}%` }}>
        {label || `${now}%`}
      </div>
    </div>
  );
}

// ---- ListGroup ----
export function ListGroup({ children, className = '', ...props }: any) {
  return <div className={`list-group ${className}`} {...props}>{children}</div>;
}
ListGroup.Item = ({ children, active, action, onClick, className = '', ...props }: any) => (
  <a href="#" className={`list-group-item ${active ? 'active' : ''} ${className}`} onClick={(e) => { e.preventDefault(); onClick?.(); }} {...props}>{children}</a>
);
