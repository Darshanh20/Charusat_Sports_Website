function FieldError({ error }) {
  if (!error) {
    return null
  }

  return <p className="mt-2 text-sm text-red-600">{error}</p>
}

function FacilityFormFields({ form, errors, onChange }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Facility Name</span>
        <input name="name" value={form.name} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600" />
        <FieldError error={errors.name} />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Subtitle</span>
        <input name="subtitle" value={form.subtitle} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600" />
        <FieldError error={errors.subtitle} />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Category</span>
        <select name="category" value={form.category} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600">
          <option value="">Select category</option>
          <option value="indoor">Indoor</option>
          <option value="outdoor">Outdoor</option>
        </select>
        <FieldError error={errors.category} />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Sport Type</span>
        <input name="sport_type" value={form.sport_type} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600" />
        <FieldError error={errors.sport_type} />
      </label>

      <label className="block md:col-span-2">
        <span className="text-sm font-medium text-slate-700">Location</span>
        <input name="location" value={form.location} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600" />
        <FieldError error={errors.location} />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Capacity</span>
        <input name="capacity" type="number" min="1" value={form.capacity} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600" />
        <FieldError error={errors.capacity} />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">External Rate per Hour in Rs</span>
        <input name="ext_rate_per_hour" type="number" min="0" value={form.ext_rate_per_hour} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600" />
        <p className="mt-2 text-xs text-slate-500">External rate applied to non-CHARUSAT users</p>
        <FieldError error={errors.ext_rate_per_hour} />
      </label>

      <div className="md:col-span-2">
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Chargeable for internal users also?</span>
            <button
              type="button"
              onClick={() => {
                const newVal = !form.is_free_for_internal
                onChange({ target: { name: 'is_free_for_internal', value: newVal } })
                if (newVal) {
                  // now free for internal -> reset internal rate
                  onChange({ target: { name: 'internal_rate_per_hour', value: 0 } })
                }
              }}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${form.is_free_for_internal ? 'bg-slate-300' : 'bg-emerald-500'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${form.is_free_for_internal ? 'translate-x-1' : 'translate-x-6'}`} />
            </button>
          </div>
          <p className={`mt-2 text-xs ${form.is_free_for_internal ? 'text-emerald-700' : 'text-amber-700'}`}>
            {form.is_free_for_internal ? 'Internal CHARUSAT members book this facility for FREE' : 'Internal members will be charged at the rate below'}
          </p>
        </label>

        {!form.is_free_for_internal ? (
          <label className="block mt-4">
            <span className="text-sm font-medium text-slate-700">Internal Rate per Hour (₹)</span>
            <input name="internal_rate_per_hour" type="number" min="0" value={form.internal_rate_per_hour} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-amber-600" />
            <p className="mt-2 text-xs text-slate-500">This rate applies to CHARUSAT students and faculty</p>
            <FieldError error={errors.internal_rate_per_hour} />
          </label>
        ) : null}
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Operating Start Time</span>
        <input name="operating_start" type="time" value={form.operating_start} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600" />
        <FieldError error={errors.operating_start} />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Operating End Time</span>
        <input name="operating_end" type="time" value={form.operating_end} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600" />
        <FieldError error={errors.operating_end} />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Slot Duration (minutes)</span>
        <input name="slot_duration_minutes" type="number" min="15" max="480" placeholder="e.g. 60" value={form.slot_duration_minutes ?? 60} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600" />
        <p className="mt-2 text-xs text-slate-500">Duration of each individual slot. e.g. 30 for Table Tennis, 60 for Badminton, 120 for Cricket</p>
        <FieldError error={errors.slot_duration_minutes} />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Max Slots Per Booking</span>
        <input name="max_slots_per_booking" type="number" min="1" max="10" value={form.max_slots_per_booking ?? 4} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600" />
        <p className="mt-2 text-xs text-slate-500">Maximum consecutive slots a single user can book at one time. e.g. 4 means user can book up to 4 consecutive 1-hour slots</p>
        <FieldError error={errors.max_slots_per_booking} />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Buffer Between Slots in minutes</span>
        <input name="buffer_minutes" type="number" min="0" value={form.buffer_minutes} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600" />
        <p className="mt-2 text-xs text-slate-500">Gap for cleaning or setup between slots</p>
        <FieldError error={errors.buffer_minutes} />
      </label>

      <label className="block md:col-span-2">
        <span className="text-sm font-medium text-slate-700">Image URL</span>
        <input name="image_url" value={form.image_url} onChange={onChange} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600" />
        <FieldError error={errors.image_url} />
      </label>
    </div>
  )
}

export default FacilityFormFields