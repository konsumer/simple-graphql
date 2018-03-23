import { SchemaDirectiveVisitor } from 'graphql-tools'

export class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition (field) {
    const oldResolve = field.resolve
    field.description = `${field.description}Requires ${this.args.role} role.`
    field.resolve = (obj, args, { user, ...ctx }) => {
      if (!user || !user.data || !user.data.roles) {
        throw new Error(`Login is required for ${field.name}.`)
      } else {
        // ADMIN supersedes all perms
        if (user.data.roles.indexOf('ADMIN') !== -1) {
          return oldResolve.apply(field, [obj, args, { user, ...ctx }])
        }

        if (user.data.roles.indexOf(this.args.role) === -1) {
          throw new Error(`Role is required: ${this.args.role}.`)
        }

        return oldResolve.apply(field, [obj, args, { user, ...ctx }])
      }
    }
  }
}

export default { auth: AuthDirective }
