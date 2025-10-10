~~## Access control privileges

This section describes the privileges that are available in the Polaris access control model. Privileges are granted to catalog roles, catalog roles are granted to principal roles, and principal roles are granted to principals to specify the operations that principals can perform on objects in Polaris.

To grant the full set of privileges (drop, list, read, write, etc.) on an object, you can use the full privilege option.

## Table privileges

|  Privilege | 	Description |
| -- | -- |
| TABLE_CREATE |	Enables registering a table with the catalog. |
| TABLE_DROP |	Enables dropping a table from the catalog. |
| TABLE_LIST |	Enables listing any table in the catalog. |
| TABLE_READ_PROPERTIES |	Enables reading properties of the table. |
| TABLE_WRITE_PROPERTIES |	Enables configuring properties for the table. |
| TABLE_READ_DATA |	Enables reading data from the table by receiving short-lived read-only storage credentials from the catalog. |
| TABLE_WRITE_DATA |	Enables writing data to the table by receiving short-lived read+write storage credentials from the catalog. |
| TABLE_FULL_METADATA |	Grants all table privileges, except TABLE_READ_DATA and TABLE_WRITE_DATA, which need to be granted individually. |
| TABLE_ATTACH_POLICY |	Enables attaching policy to a table. |
| TABLE_DETACH_POLICY |	Enables detaching policy from a table. |

## View privileges 

| Privilege |	Description |
| -- | -- |
| VIEW_CREATE |	Enables registering a view with the catalog. |
| VIEW_DROP |	Enables dropping a view from the catalog. |
| VIEW_LIST |	Enables listing any views in the catalog. |
| VIEW_READ_PROPERTIES |	Enables reading all the view properties. |
| VIEW_WRITE_PROPERTIES |	Enables configuring view properties. |
| VIEW_FULL_METADATA |	Grants all view privileges. |

## Namespace privileges

| Privilege |	Description |
| -- | -- |
| NAMESPACE_CREATE |	Enables creating a namespace in a catalog. |
| NAMESPACE_DROP |	Enables dropping the namespace from the catalog. |
| NAMESPACE_LIST |	Enables listing any object in the namespace, including nested namespaces and tables. |
| NAMESPACE_READ_PROPERTIES |	Enables reading all the namespace properties. |
| NAMESPACE_WRITE_PROPERTIES |	Enables configuring namespace properties. |
| NAMESPACE_FULL_METADATA |	Grants all namespace privileges. |
| NAMESPACE_ATTACH_POLICY |	Enables attaching policy to a namespace. |
| NAMESPACE_DETACH_POLICY |	Enables detaching policy from a namespace. |

## Catalog privileges

| Privilege |	Description |
| -- | -- |
| CATALOG_MANAGE_ACCESS |	Includes the ability to grant or revoke privileges on objects in a catalog to catalog roles, and the ability to grant or revoke catalog roles to or from principal roles. |
| CATALOG_MANAGE_CONTENT |	Enables full management of content for the catalog. This privilege encompasses the following privileges:<br>CATALOG_MANAGE_METADATA<br>TABLE_FULL_METADATA<br>NAMESPACE_FULL_METADATA<br>VIEW_FULL_METADATA<br>TABLE_WRITE_DATA<br>TABLE_READ_DATA<br>CATALOG_READ_PROPERTIES<br>CATALOG_WRITE_PROPERTIES |
| CATALOG_MANAGE_METADATA |	Enables full management of the catalog, catalog roles, namespaces, and tables. |
| CATALOG_READ_PROPERTIES |	Enables listing catalogs and reading properties of the catalog. |
| CATALOG_WRITE_PROPERTIES |	Enables configuring catalog properties. |
| CATALOG_ATTACH_POLICY |	Enables attaching policy to a catalog. |
| CATALOG_DETACH_POLICY |	Enables detaching policy from a catalog. |

## Policy privileges

| Privilege |	Description |
| -- | -- |
| POLICY_CREATE |	Enables creating a policy under specified namespace. |
| POLICY_READ |	Enables reading policy content and metadata. |
| POLICY_WRITE |	Enables updating the policy details such as its content or description. |
| POLICY_LIST |	Enables listing any policy from the catalog. |
| POLICY_DROP |	Enables dropping a policy if it is not attached to any resource entity. |
| POLICY_FULL_METADATA |	Grants all policy privileges. |
| POLICY_ATTACH |	Enables policy to be attached to entities. |
| POLICY_DETACH |	Enables policy to be detached from entities. |~~
